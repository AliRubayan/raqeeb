import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  findContractById,
  upsertContractFromN8n,
  updateContractStatus,
  updateContractStreamChannel,
} from "../repositories/contracts";
import {
  saveAuditResult,
  getAuditResultByContract,
  type N8nAuditPayload,
} from "../repositories/audit-results";
import { addAuditLog, getAuditLogsByContract } from "../repositories/audit-logs";
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

  const rawPayload = req.body as Record<string, unknown>;
  logger.info({ payload: rawPayload }, "n8n webhook received — raw payload");

  // --- Extract all fields n8n sends (trim whitespace from IDs) ---
  const str = (key: string): string | undefined => {
    const v = rawPayload[key];
    return typeof v === "string" ? v.trim() : undefined;
  };

  const contractId = str("contractId") ?? str("contract_id");
  const userId     = str("userId")     ?? str("user_id");
  const contractText = str("contractText") ?? str("contract_text") ?? "";
  const contractName = str("contractName") ?? str("contract_name") ?? "عقد";

  const inspectorResult = str("inspector") ?? str("inspector_result") ?? "";
  const lawResult       = str("lawfinder") ?? str("law_finder") ?? str("law_result") ?? "";
  const drafterResult   = str("drafter")   ?? str("drafter_result") ?? "";

  // ── Smart risk score derivation ──────────────────────────────────────────
  // n8n sometimes sends risk_score: "0" + severity: "none" even when the
  // inspector output clearly shows VIOLATION_FOUND: yes / SEVERITY: high.
  // We parse the inspector text as ground truth and override when conflicting.

  /** Extract a KEY: value pair from the inspector structured text */
  const extractInspectorField = (text: string, key: string): string => {
    const match = text.match(new RegExp(`^${key}\\s*:\\s*(.+)`, "im"));
    return match?.[1]?.trim() ?? "";
  };

  const inspectorViolation = extractInspectorField(inspectorResult, "VIOLATION_FOUND");
  const inspectorSeverityRaw = extractInspectorField(inspectorResult, "SEVERITY");

  // Detect a violation from either n8n's boolean flag OR inspector text
  const violationDetected =
    rawPayload["violation_found"] === true ||
    String(rawPayload["violation_found"]).toLowerCase() === "true" ||
    /^(yes|نعم|true|1)/i.test(inspectorViolation);

  /** Map a severity string (Arabic or English) to a 0-10 risk score */
  const severityToScore = (sev: string): number => {
    const s = sev.toLowerCase();
    if (/high|عال|عالي|عالية|critical/.test(s)) return 8.5;
    if (/medium|متوسط|متوسطة|moderate/.test(s)) return 5.5;
    if (/low|منخفض|منخفضة/.test(s)) return 2.5;
    return 0;
  };

  // n8n sends risk_score on a 0-100 scale; normalise to 0-10 for storage
  const rawRiskScore = Number(rawPayload["risk_score"] ?? 0);
  let riskScore = rawRiskScore > 10 ? Math.round((rawRiskScore / 10) * 10) / 10 : rawRiskScore;

  // If n8n's top-level risk_score is 0 but inspector found a violation,
  // derive the score from the inspector's own SEVERITY field.
  if (riskScore === 0 && violationDetected) {
    riskScore = severityToScore(inspectorSeverityRaw) || severityToScore(String(rawPayload["severity"] ?? ""));
  }

  // Prefer inspector's severity over n8n's top-level when n8n says "none"
  const rawSeverity = String(rawPayload["severity"] ?? "");
  const severity = normalizeSeverity(
    /none|approved|clean/i.test(rawSeverity) && violationDetected
      ? inspectorSeverityRaw
      : rawSeverity,
  );

  logger.info(
    { inspectorViolation, inspectorSeverityRaw, violationDetected, riskScoreDerived: riskScore },
    "n8n webhook — smart risk derivation",
  );

  if (!contractId) {
    logger.warn({ rawPayload }, "n8n webhook missing contractId — rejecting");
    res.status(400).json({ error: "contractId is required", received: Object.keys(rawPayload) });
    return;
  }

  logger.info({ contractId, userId, riskScore, severity }, "n8n webhook — resolved fields");

  // --- Step 1: Upsert contract row (INSERT ... ON CONFLICT DO NOTHING) ---
  // Satisfies FK constraint whether n8n uses our UUID or its own.
  if (userId) {
    await upsertContractFromN8n({ id: contractId, userId, contractText, contractName, status: "Completed" });
  } else {
    logger.warn({ contractId }, "n8n callback missing userId — contract must already exist in DB");
  }

  // --- Step 2: INSERT audit result (pass full raw payload as rawResponse) ---
  await saveAuditResult(contractId, {
    risk_score: riskScore,
    severity,
    inspector_result: inspectorResult,
    law_result: lawResult,
    drafter_result: drafterResult,
    rawResponse: rawPayload,
  });

  // --- Step 3: Append audit timeline events ---
  // Use violationDetected (which checks both n8n flag AND inspector text)
  await addAuditLog(contractId, "تحليل العقد اكتمل — Inspector أنهى فحصه");
  await addAuditLog(contractId, "Law Finder حدّد المراجع القانونية ذات الصلة");
  await addAuditLog(contractId, "Drafter أعدّ التوصيات والصياغة البديلة");
  if (violationDetected) {
    await addAuditLog(contractId, `⚠️ تم رصد مخاطر — درجة الخطورة: ${severity} — درجة المخاطر: ${riskScore}`);
  } else {
    await addAuditLog(contractId, "✅ لم تُرصد انتهاكات — العقد يبدو متوافقاً");
  }

  // --- Step 4: Mark contract Completed + set Stream channel ---
  await updateContractStatus(contractId, "Completed");
  await updateContractStreamChannel(contractId, `audit-${contractId}`);

  logger.info({ contractId, riskScore }, "Audit results inserted from n8n");
  res.json({ message: "Audit results saved successfully", contractId });
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

// Live Timeline feed — returns chronological audit log events for a contract
router.get("/:contractId/logs", requireAuth, async (req, res) => {
  const contract = await findContractById(req.params.contractId as string);
  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }
  if (contract.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const logs = await getAuditLogsByContract(contract.id);
  res.json(logs);
});

export default router;
