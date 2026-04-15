import { eq } from "drizzle-orm";
import {
  db,
  auditResultsTable,
  type InsertAuditResult,
  type AuditResult,
} from "@workspace/db";

export interface N8nAuditPayload {
  risk_score: number;
  severity: "Low" | "Medium" | "High";
  inspector_result: string;
  law_result: string;
  drafter_result: string;
}

export async function saveAuditResult(
  contractId: string,
  n8nPayload: N8nAuditPayload,
): Promise<AuditResult> {
  const data: InsertAuditResult = {
    contractId,
    riskScore: n8nPayload.risk_score,
    severity: n8nPayload.severity,
    inspectorOutput: n8nPayload.inspector_result,
    lawFinderOutput: n8nPayload.law_result,
    drafterOutput: n8nPayload.drafter_result,
    n8nRawResponse: JSON.stringify(n8nPayload),
  };

  const result = await db.insert(auditResultsTable).values(data).returning();
  return result[0]!;
}

export async function getAuditResultByContract(
  contractId: string,
): Promise<AuditResult | undefined> {
  const result = await db
    .select()
    .from(auditResultsTable)
    .where(eq(auditResultsTable.contractId, contractId))
    .limit(1);
  return result[0];
}

export async function getAllAuditResults(): Promise<AuditResult[]> {
  return db.select().from(auditResultsTable);
}
