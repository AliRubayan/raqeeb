import { eq, desc } from "drizzle-orm";
import {
  db,
  auditLogsTable,
  type InsertAuditLog,
  type AuditLog,
} from "@workspace/db";

export async function addAuditLog(
  contractId: string,
  eventDescription: string,
): Promise<AuditLog> {
  const data: InsertAuditLog = {
    contractId: contractId.trim(),
    eventDescription,
  };
  const result = await db.insert(auditLogsTable).values(data).returning();
  return result[0]!;
}

export async function getAuditLogsByContract(contractId: string): Promise<AuditLog[]> {
  return db
    .select()
    .from(auditLogsTable)
    .where(eq(auditLogsTable.contractId, contractId.trim()))
    .orderBy(desc(auditLogsTable.createdAt));
}
