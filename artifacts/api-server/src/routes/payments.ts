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
  process.env["STREAMPAY_AUDIT_PRODUCT_ID"] ?? "75ce36be-0331-48d6-a40a-0b8b44b839f6";

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

  const baseUrl = process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : "http://localhost:80";

  const paymentLink = await createPaymentLink({
    name: `اشتراك رقيب — ${contractName}`,
    description: `اشتراك دائم للوصول إلى تحليل العقود`,
    items: [{ product_id: SUBSCRIPTION_PRODUCT_ID, quantity: 1 }],
    contractId,
    successRedirectUrl: `${baseUrl}/payment-success?contractId=${contractId}`,
    failureRedirectUrl: `${baseUrl}/payment-failed?contractId=${contractId}`,
  });

  await updateContractPaymentLink(contractId, paymentLink.id, paymentLink.url);

  res.json({
    paymentLinkId: paymentLink.id,
    paymentUrl: paymentLink.url,
    status: paymentLink.status,
    contractId,
  });
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
