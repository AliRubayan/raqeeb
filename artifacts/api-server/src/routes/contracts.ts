import { Router } from "express";
import multer from "multer";
// Import from lib path to skip pdf-parse's broken top-level test file read
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buf: Buffer) => Promise<{ text: string; numpages: number }> =
  require("pdf-parse/lib/pdf-parse.js");
import { requireAuth } from "../middlewares/requireAuth";
import {
  createContract,
  findContractById,
  getContractsByUser,
  updateContractStatus,
} from "../repositories/contracts";
import { getAuditResultByContract } from "../repositories/audit-results";
import { logger } from "../lib/logger";

const router = Router();

const N8N_WEBHOOK_URL = process.env["N8N_WEBHOOK_URL"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

async function dispatchToN8n(params: {
  contractId: string;
  contractName: string;
  contractText: string;
  userId: string;
}) {
  if (!N8N_WEBHOOK_URL) {
    logger.warn({ contractId: params.contractId }, "N8N_WEBHOOK_URL not set — skipping n8n dispatch");
    return;
  }
  try {
    await updateContractStatus(params.contractId, "Analyzing");
    fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractId: params.contractId,
        contractName: params.contractName,
        contractText: params.contractText,
        userId: params.userId,
      }),
    }).catch((err) => {
      logger.error({ err, contractId: params.contractId }, "Failed to send contract to n8n");
    });
    logger.info({ contractId: params.contractId }, "Contract dispatched to n8n");
  } catch (err) {
    logger.error({ err, contractId: params.contractId }, "Failed to dispatch to n8n");
  }
}

router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "A PDF file is required (field name: file)" });
      return;
    }

    const contractName =
      (req.body as { contractName?: string }).contractName ||
      req.file.originalname.replace(/\.pdf$/i, "");

    let contractText: string;
    try {
      const parsed = await pdfParse(req.file.buffer);
      contractText = parsed.text.trim();
    } catch {
      res.status(422).json({ error: "Failed to extract text from the PDF. Please check the file." });
      return;
    }

    if (!contractText || contractText.length < 20) {
      res.status(422).json({ error: "PDF appears to be empty or image-only (no extractable text)." });
      return;
    }

    const contract = await createContract({
      userId: req.session.userId!,
      contractName,
      contractText,
      status: "Paid",
    });

    logger.info(
      { contractId: contract.id, userId: req.session.userId, pages: (req as any).file?.size },
      "PDF uploaded and contract created",
    );

    await dispatchToN8n({
      contractId: contract.id,
      contractName: contract.contractName,
      contractText,
      userId: req.session.userId!,
    });

    res.status(201).json({
      id: contract.id,
      contractName: contract.contractName,
      status: "Analyzing",
      createdAt: contract.createdAt,
      message: "PDF uploaded and sent to AI agents for analysis.",
      textLength: contractText.length,
    });
  },
);

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

  await dispatchToN8n({
    contractId: contract.id,
    contractName: contract.contractName,
    contractText,
    userId: req.session.userId!,
  });

  res.status(201).json({
    id: contract.id,
    contractName: contract.contractName,
    status: "Analyzing",
    createdAt: contract.createdAt,
    message: "Contract received and sent to AI agents for analysis.",
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
