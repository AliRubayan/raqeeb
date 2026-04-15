import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  isStreamConfigured,
  generateUserToken,
  createConsultationChannel,
  forwardToN8nP2,
} from "../lib/stream-chat";
import { findContractById } from "../repositories/contracts";
import { findUserById } from "../repositories/users";
import { logger } from "../lib/logger";

const router = Router();

const STREAM_API_KEY = process.env["STREAM_API_KEY"];

// GET /api/stream/token
// Returns a Stream Chat user token + API key so the frontend can connect
router.get("/token", requireAuth, async (req, res) => {
  if (!isStreamConfigured()) {
    res.status(503).json({
      error: "Stream Chat is not configured. STREAM_API_KEY and STREAM_API_SECRET must be set.",
    });
    return;
  }

  const user = await findUserById(req.session.userId!);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const token = await generateUserToken(req.session.userId!, user.email);

  res.json({
    token,
    apiKey: STREAM_API_KEY,
    userId: req.session.userId,
    userName: user.email,
  });
});

// POST /api/stream/channel/:contractId
// Creates or retrieves the consultation channel for a contract
router.post("/channel/:contractId", requireAuth, async (req, res) => {
  if (!isStreamConfigured()) {
    res.status(503).json({
      error: "Stream Chat is not configured.",
    });
    return;
  }

  const contract = await findContractById(req.params.contractId as string);
  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  if (contract.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (contract.status !== "Completed") {
    res.status(400).json({ error: "Consultation is only available after the audit is complete." });
    return;
  }

  const { channelId, channelType } = await createConsultationChannel(
    contract.id,
    contract.contractName,
    req.session.userId!,
  );

  res.json({
    channelId,
    channelType,
    contractId: contract.id,
    contractName: contract.contractName,
  });
});

// POST /api/stream/message/:contractId
// Called by the frontend when the user sends a message in the consultation chat.
// Forwards the message to n8np2 for AI response.
router.post("/message/:contractId", requireAuth, async (req, res) => {
  const { message, channelId } = req.body as { message?: string; channelId?: string };

  if (!message || !channelId) {
    res.status(400).json({ error: "message and channelId are required" });
    return;
  }

  const contract = await findContractById(req.params.contractId as string);
  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  if (contract.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Fire and forget to n8np2
  forwardToN8nP2(
    message,
    contract.id,
    contract.contractName,
    req.session.userId!,
    channelId,
  ).catch((err) => {
    logger.error({ err, contractId: contract.id }, "Failed to forward message to n8np2");
  });

  res.json({ forwarded: true, contractId: contract.id });
});

export default router;
