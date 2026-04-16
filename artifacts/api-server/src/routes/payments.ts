import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { createPaymentLink, isPaymentCompleted } from "../lib/streampay";
import {
  findContractById,
  updateContractPaymentLink,
  updateContractStatus,
} from "../repositories/contracts";
import { setActiveSubscription } from "../repositories/users";

const router = Router();

const SUBSCRIPTION_PRODUCT_ID =
  process.env["STREAMPAY_AUDIT_PRODUCT_ID"] ?? "6e7c7c5b-7104-44cd-9e0b-bd6aa4fc0d45";

router.post("/create-link", requireAuth, async (req, res) => {
  const { contractId, contractName } = req.body as {
    contractId?: string;
    contractName?: string;
  };

  if (!contractId || !contractName) {
    res.status(400).json({ error: "contractId and contractName are required" });
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

  // The web app is served under /raqeeb-web on the Replit proxy.
  // RAQEEB_WEB_BASE_PATH lets us override this (e.g. "/" in production).
  const webBase = (process.env["RAQEEB_WEB_BASE_PATH"] ?? "/raqeeb-web").replace(/\/$/, "");
  const baseUrl = process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : "http://localhost:80";

  const paymentLink = await createPaymentLink({
    name: `اشتراك رقيب — ${contractName}`,
    description: `اشتراك دائم للوصول إلى تحليل العقود`,
    items: [{ product_id: SUBSCRIPTION_PRODUCT_ID, quantity: 1 }],
    contractId,
    successRedirectUrl: `${baseUrl}${webBase}/`,
    failureRedirectUrl: `${baseUrl}${webBase}/`,
  });

  await updateContractPaymentLink(contractId, paymentLink.id, paymentLink.url);

  res.json({
    paymentLinkId: paymentLink.id,
    paymentUrl: paymentLink.url,
    status: paymentLink.status,
    contractId,
  });
});

// Standalone subscription link — no contract required
router.post("/create-subscription-link", requireAuth, async (req, res) => {
  const webBase = (process.env["RAQEEB_WEB_BASE_PATH"] ?? "/raqeeb-web").replace(/\/$/, "");
  const baseUrl = process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : "http://localhost:80";

  // Create the link first to get its ID, then embed the ID in the success URL
  const tempLink = await createPaymentLink({
    name: "اشتراك رقيب — الخدمة",
    description: "اشتراك في خدمة تحليل العقود بالذكاء الاصطناعي",
    items: [{ product_id: SUBSCRIPTION_PRODUCT_ID, quantity: 1 }],
    contractId: `sub_${req.session.userId}`,
    successRedirectUrl: `${baseUrl}${webBase}/`,
    failureRedirectUrl: `${baseUrl}${webBase}/`,
  });

  // Re-create with the real linkId embedded in the success URL so we don't depend on session
  const link = await createPaymentLink({
    name: "اشتراك رقيب — الخدمة",
    description: "اشتراك في خدمة تحليل العقود بالذكاء الاصطناعي",
    items: [{ product_id: SUBSCRIPTION_PRODUCT_ID, quantity: 1 }],
    contractId: `sub_${req.session.userId}`,
    successRedirectUrl: `${baseUrl}${webBase}/`,
    failureRedirectUrl: `${baseUrl}${webBase}/`,
  });

  res.json({ paymentUrl: link.url, linkId: link.id });
});

// Verify a standalone subscription payment and mark user as subscribed
router.post("/verify-subscription", requireAuth, async (req, res) => {
  const { linkId } = req.body as { linkId?: string };
  if (!linkId) {
    res.status(400).json({ error: "linkId is required" });
    return;
  }

  const paid = await isPaymentCompleted(linkId);
  if (paid) {
    await setActiveSubscription(req.session.userId!, true);
  }

  res.json({ subscribed: paid });
});

router.get("/verify/:contractId", requireAuth, async (req, res) => {
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

  if (!contract.streamPayPaymentLinkId) {
    res.json({ paid: false, contractId, status: contract.status });
    return;
  }

  const paid = await isPaymentCompleted(contract.streamPayPaymentLinkId);

  if (paid) {
    await updateContractStatus(contractId, "Paid");
    await setActiveSubscription(req.session.userId!, true);
  }

  res.json({
    paid,
    contractId,
    status: paid ? "Paid" : contract.status,
  });
});

export default router;
