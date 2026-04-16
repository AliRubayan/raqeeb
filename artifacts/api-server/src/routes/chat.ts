import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { findContractById } from "../repositories/contracts";
import { getAuditResultByContract } from "../repositories/audit-results";
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

  // Fetch audit results so the n8n chat agent has full analysis context
  const auditResult = await getAuditResultByContract(contractId).catch(() => undefined);

  const N8N_CHAT_WEBHOOK = process.env["N8NP2_WEBHOOK_URL"];

  if (!N8N_CHAT_WEBHOOK) {
    logger.warn("N8NP2_WEBHOOK_URL not configured — returning fallback");
    res.status(503).json({ error: "خدمة الاستشارة غير متاحة حالياً" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    logger.info(
      { contractId, message, hasAuditResult: !!auditResult },
      "Forwarding chat message to n8n with audit context",
    );

    const n8nRes = await fetch(N8N_CHAT_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Contract identity
        contract_id: contractId,
        contractId,
        contract_name: contract.contractName,
        contractName: contract.contractName,
        contract_text: contract.contractText,
        contractText: contract.contractText,

        // Audit findings — give the AI agent full context for follow-up questions
        inspector: auditResult?.inspectorOutput ?? null,
        inspector_output: auditResult?.inspectorOutput ?? null,
        lawfinder: auditResult?.lawFinderOutput ?? null,
        law_finder_output: auditResult?.lawFinderOutput ?? null,
        drafter: auditResult?.drafterOutput ?? null,
        drafter_output: auditResult?.drafterOutput ?? null,
        risk_score: auditResult?.riskScore ?? null,
        severity: auditResult?.severity ?? null,

        // User question
        message,
        userId: req.session.userId,
      }),
      signal: controller.signal,
    });

    if (!n8nRes.ok) {
      throw new Error(`n8n returned ${n8nRes.status}`);
    }

    const raw = await n8nRes.json() as unknown;
    logger.info({ contractId, raw }, "Raw n8n chat response");

    // n8n sometimes wraps response in an array — unwrap it
    const data = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>;

    // Pick first non-empty, non-template-literal string value
    const isValid = (v: unknown): v is string =>
      typeof v === "string" && v.trim().length > 0 && !v.includes("{{");

    const reply =
      (isValid(data["reply"]) ? data["reply"] : null) ??
      (isValid(data["message"]) ? data["message"] : null) ??
      (isValid(data["output"]) ? data["output"] : null) ??
      (isValid(data["text"]) ? data["text"] : null) ??
      (isValid(data["answer"]) ? data["answer"] : null) ??
      (isValid(data["response"]) ? data["response"] : null) ??
      Object.values(data).find(isValid) ??
      null;

    // All values were unevaluated n8n template expressions — workflow misconfiguration
    if (!reply) {
      logger.warn(
        { contractId, raw },
        "n8n chat response contains only unevaluated templates — n8n team must enable expression mode (= toggle) on the 'reply' field in the 'Respond to Webhook' node of raqeeb-chat workflow",
      );
      res.status(503).json({
        error: "المساعد القانوني غير متاح مؤقتاً، يرجى المحاولة مرة أخرى لاحقاً.",
        retryable: true,
      });
      return;
    }

    logger.info({ contractId, reply }, "Chat reply extracted");
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
