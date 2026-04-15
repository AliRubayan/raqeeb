import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { findContractById } from "../repositories/contracts";
import { logger } from "../lib/logger";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { contractId, message } = req.body as {
    contractId?: string;
    message?: string;
  };

  if (!contractId || !message) {
    res.status(400).json({ error: "contractId and message are required" });
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

  const N8N_CHAT_WEBHOOK = process.env["N8NP2_WEBHOOK_URL"];

  if (!N8N_CHAT_WEBHOOK) {
    logger.warn("N8NP2_WEBHOOK_URL not configured — returning fallback");
    res.status(503).json({ error: "خدمة الاستشارة غير متاحة حالياً" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    logger.info({ contractId, message }, "Forwarding chat message to n8n");

    const n8nRes = await fetch(N8N_CHAT_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractId,
        contractName: contract.contractName,
        contractText: contract.contractText,
        message,
        userId: req.session.userId,
      }),
      signal: controller.signal,
    });

    if (!n8nRes.ok) {
      throw new Error(`n8n returned ${n8nRes.status}`);
    }

    const data = await n8nRes.json() as Record<string, unknown>;
    const reply =
      (data["reply"] as string) ??
      (data["message"] as string) ??
      (data["output"] as string) ??
      (data["text"] as string) ??
      JSON.stringify(data);

    logger.info({ contractId }, "Chat reply received from n8n");
    res.json({ reply });
  } catch (err: any) {
    if (err.name === "AbortError") {
      logger.warn({ contractId }, "Chat n8n request timed out");
      res.status(504).json({ error: "انتهت مهلة خدمة الاستشارة، يرجى المحاولة مرة أخرى" });
    } else {
      logger.error({ err, contractId }, "Chat n8n request failed");
      res.status(502).json({ error: "تعذّر الاتصال بخدمة الاستشارة" });
    }
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
