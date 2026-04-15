import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  createContract,
  findContractById,
  getContractsByUser,
} from "../repositories/contracts";
import { getAuditResultByContract } from "../repositories/audit-results";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { contractName, contractText } = req.body as {
    contractName?: string;
    contractText?: string;
  };

  if (!contractName || !contractText) {
    res.status(400).json({ error: "contractName and contractText are required" });
    return;
  }

  const contract = await createContract({
    userId: req.session.userId!,
    contractName,
    contractText,
    status: "Paid",
  });

  res.status(201).json({
    id: contract.id,
    contractName: contract.contractName,
    status: contract.status,
    createdAt: contract.createdAt,
  });
});

router.get("/history", requireAuth, async (req, res) => {
  const contracts = await getContractsByUser(req.session.userId!);

  const contractsWithAudits = await Promise.all(
    contracts.map(async (c) => {
      const audit = await getAuditResultByContract(c.id);
      return {
        id: c.id,
        contractName: c.contractName,
        status: c.status,
        streamChannelId: c.streamChannelId,
        streamPayPaymentLinkUrl: c.streamPayPaymentLinkUrl,
        createdAt: c.createdAt,
        auditResult: audit
          ? {
              id: audit.id,
              riskScore: audit.riskScore,
              severity: audit.severity,
              createdAt: audit.createdAt,
            }
          : null,
      };
    }),
  );

  res.json({ contracts: contractsWithAudits });
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

  res.json({
    id: contract.id,
    contractName: contract.contractName,
    status: contract.status,
    streamChannelId: contract.streamChannelId,
    streamPayPaymentLinkUrl: contract.streamPayPaymentLinkUrl,
    createdAt: contract.createdAt,
    auditResult: audit
      ? {
          id: audit.id,
          riskScore: audit.riskScore,
          severity: audit.severity,
          createdAt: audit.createdAt,
        }
      : null,
  });
});

export default router;
