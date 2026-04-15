import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  findContractById,
  updateContractStatus,
  updateContractStreamChannel,
} from "../repositories/contracts";
import {
  saveAuditResult,
  getAuditResultByContract,
  type N8nAuditPayload,
} from "../repositories/audit-results";
import { isPaymentCompleted } from "../lib/streampay";
import { findUserById } from "../repositories/users";
import { logger } from "../lib/logger";

const router = Router();

const N8N_WEBHOOK_URL = process.env["N8N_WEBHOOK_URL"];

router.post("/start", requireAuth, async (req, res) => {
  const { contractId } = req.body as { contractId?: string };

  if (!contractId) {
    res.status(400).json({ error: "contractId is required" });
    return;
  }

  const contract = await findContractById(contractId);
  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  if (contract.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Gatekeeper: allow if user has active subscription OR payment verified
  const user = await findUserById(req.session.userId!);
  const hasSubscription = user?.hasActiveSubscription ?? false;

  if (!hasSubscription) {
    if (!contract.streamPayPaymentLinkId) {
      res.status(402).json({
        error: "Subscription required. Please subscribe before starting the audit.",
      });
      return;
    }
    const paid = await isPaymentCompleted(contract.streamPayPaymentLinkId);
    if (!paid) {
      res.status(402).json({
        error: "Payment required. Please complete payment before starting the audit.",
      });
      return;
    }
  }

  // Mark as Analyzing
  await updateContractStatus(contractId, "Analyzing");

  // Fire and forget to n8n webhook
  if (N8N_WEBHOOK_URL) {
    const n8nPayload = {
      contract_id: contractId,
      contractId,
      contract_text: contract.contractText,
      contractText: contract.contractText,
      contract_name: contract.contractName,
      contractName: contract.contractName,
      userId: req.session.userId,
    };
    logger.info({ contractId, textLength: contract.contractText?.length ?? 0 }, "Sending contract to n8n");
    fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nPayload),
    }).catch((err) => {
      logger.error({ err, contractId }, "Failed to send contract to n8n webhook");
    });
  } else {
    logger.warn({ contractId }, "N8N_WEBHOOK_URL not set — skipping n8n dispatch");
  }

  res.status(202).json({
    contractId,
    status: "Analyzing",
    message:
      "Audit started. The three agents (Inspector, Law Finder, Drafter) are now analyzing your contract.",
  });
});

function normalizeSeverity(raw: string): "Low" | "Medium" | "High" {
  const s = (raw ?? "").toLowerCase();
  if (s === "high") return "High";
  if (s === "medium" || s === "med") return "Medium";
  return "Low";
}

// Called by n8n when all three AI agents finish
// n8n must include the header: X-Api-Key: <N8N_API_KEY>
router.post("/webhook/n8n", async (req, res) => {
  const N8N_API_KEY = process.env["N8N_API_KEY"];
  if (N8N_API_KEY) {
    const incoming = req.headers["x-api-key"];
    if (!incoming || incoming !== N8N_API_KEY) {
      logger.warn({ ip: req.ip }, "n8n webhook rejected — invalid or missing X-Api-Key");
      res.status(401).json({ error: "Unauthorized: invalid API key" });
      return;
    }
  }

  const payload = req.body as N8nAuditPayload & {
    contractId?: string;
    contract_id?: string;
  };

  logger.info({ payload }, "n8n webhook received — raw payload");

  // Accept both camelCase and snake_case for contractId
  const contractId = payload.contractId ?? payload.contract_id;

  if (!contractId) {
    logger.warn({ payload }, "n8n webhook missing contractId — rejecting");
    res.status(400).json({ error: "contractId is required in the n8n payload", received: payload });
    return;
  }

  // Mutate so the rest of the handler uses the resolved value
  payload.contractId = contractId;

  const contract = await findContractById(payload.contractId);
  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  // Save the n8n results to the audit_results table
  await saveAuditResult(payload.contractId, {
    risk_score: payload.risk_score,
    severity: normalizeSeverity(String(payload.severity)),
    inspector_result: payload.inspector_result ?? "",
    law_result: payload.law_result ?? "",
    drafter_result: payload.drafter_result ?? "",
  });

  // Update contract status to Completed
  await updateContractStatus(payload.contractId, "Completed");

  // Create a Stream Chat channel ID for the Decision Room (pattern: audit-{contractId})
  const streamChannelId = `audit-${payload.contractId}`;
  await updateContractStreamChannel(payload.contractId, streamChannelId);

  logger.info(
    { contractId: payload.contractId, riskScore: payload.risk_score },
    "Audit results received and saved from n8n",
  );

  res.json({ message: "Audit results saved successfully" });
});

router.get("/:contractId", requireAuth, async (req, res) => {
  const contract = await findContractById(req.params.contractId as string);

  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  if (contract.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const audit = await getAuditResultByContract(contract.id);
  if (!audit) {
    res.status(404).json({ error: "Audit result not found. Analysis may still be in progress." });
    return;
  }

  res.json({
    id: audit.id,
    contractId: audit.contractId,
    riskScore: audit.riskScore,
    severity: audit.severity,
    inspectorOutput: audit.inspectorOutput,
    lawFinderOutput: audit.lawFinderOutput,
    drafterOutput: audit.drafterOutput,
    createdAt: audit.createdAt,
  });
});

router.post("/:contractId/action", requireAuth, async (req, res) => {
  const { action } = req.body as { action?: "Approve" | "Reject" | "Review" };
  const contractId = req.params.contractId as string;

  if (!action || !["Approve", "Reject", "Review"].includes(action)) {
    res.status(400).json({ error: "action must be one of: Approve, Reject, Review" });
    return;
  }

  const contract = await findContractById(contractId);
  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  if (contract.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  let newStatus: "Completed" | "Rejected" | "Analyzing";
  let message: string;

  switch (action) {
    case "Approve":
      newStatus = "Completed";
      message = "Contract approved and finalized. A success report has been generated.";
      break;
    case "Reject":
      newStatus = "Rejected";
      message = "Contract rejected. The audit has been discarded.";
      break;
    case "Review":
      newStatus = "Analyzing";
      message = "Contract sent for a second AI review pass.";
      // Re-trigger n8n for second pass
      if (N8N_WEBHOOK_URL) {
        fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract_id: contractId,
            contractId,
            contract_text: contract.contractText,
            contractText: contract.contractText,
            contract_name: contract.contractName,
            contractName: contract.contractName,
            userId: contract.userId,
            isReview: true,
          }),
        }).catch((err) => {
          logger.error({ err, contractId }, "Failed to re-send contract to n8n for review");
        });
      }
      break;
  }

  await updateContractStatus(contractId, newStatus!);

  res.json({
    contractId,
    action,
    newStatus: newStatus!,
    message: message!,
  });
});

export default router;
