import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  findContractById,
  updateContractStatus,
  updateContractPaymentLink,
  updateContractStreamChannel,
} from "../repositories/contracts";
import { saveAuditResult } from "../repositories/audit-results";
import { setActiveSubscription } from "../repositories/users";
import { logger } from "../lib/logger";

const router = Router();

const N8N_WEBHOOK_URL = process.env["N8N_WEBHOOK_URL"];

if (process.env["NODE_ENV"] === "production") {
  router.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
} else {
  router.post("/simulate-payment/:contractId", requireAuth, async (req, res) => {
    const contractId = req.params.contractId as string;

    const contract = await findContractById(contractId);
    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    if (contract.userId !== req.session.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    logger.info({ contractId }, "[DEV] Simulating payment success — bypassing StreamPay");

    await updateContractPaymentLink(
      contractId,
      "dev-simulated-payment",
      "https://dev-simulated-no-real-payment",
    );

    await updateContractStatus(contractId, "Paid");
    await setActiveSubscription(req.session.userId!, true);

    await updateContractStatus(contractId, "Analyzing");

    if (N8N_WEBHOOK_URL) {
      fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          contractText: contract.contractText,
          contractName: contract.contractName,
          userId: req.session.userId,
        }),
      }).catch((err) => {
        logger.error({ err, contractId }, "[DEV] Failed to send contract to n8n webhook");
      });

      logger.info({ contractId, n8nUrl: N8N_WEBHOOK_URL }, "[DEV] n8n webhook fired successfully");
    } else {
      logger.warn({ contractId }, "[DEV] N8N_WEBHOOK_URL not set — skipping n8n dispatch");
    }

    res.json({
      success: true,
      contractId,
      status: "Analyzing",
      message: "[DEV] Payment simulated. Audit started — n8n webhook fired. Watch logs for n8n response.",
      n8nFired: !!N8N_WEBHOOK_URL,
      note: "This endpoint only works in development. It will return 404 in production.",
    });
  });

  router.post("/simulate-n8n/:contractId", async (req, res) => {
    const contractId = req.params.contractId as string;

    const contract = await findContractById(contractId);
    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    const {
      risk_score = 7.5,
      severity = "High",
      inspector_result = "Inspector result (simulated).",
      law_result = "Law result (simulated).",
      drafter_result = "Drafter result (simulated).",
    } = req.body as {
      risk_score?: number;
      severity?: string;
      inspector_result?: string;
      law_result?: string;
      drafter_result?: string;
    };

    const normSeverity = (s: string): "Low" | "Medium" | "High" => {
      const l = s.toLowerCase();
      if (l === "high") return "High";
      if (l === "medium" || l === "med") return "Medium";
      return "Low";
    };

    await saveAuditResult(contractId, {
      risk_score,
      severity: normSeverity(severity),
      inspector_result,
      law_result,
      drafter_result,
    });

    await updateContractStatus(contractId, "Completed");
    await updateContractStreamChannel(contractId, `audit-${contractId}`);

    logger.info({ contractId }, "[DEV] Simulated n8n audit result saved");

    res.json({
      success: true,
      contractId,
      message: "[DEV] Audit result saved. Contract is now Completed.",
    });
  });

  logger.info("[DEV] Dev routes enabled — /api/dev/* is active (development only)");
}

export default router;
