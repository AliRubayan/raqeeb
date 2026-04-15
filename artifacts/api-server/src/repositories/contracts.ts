import { eq, desc } from "drizzle-orm";
import {
  db,
  contractsTable,
  type InsertContract,
  type Contract,
} from "@workspace/db";

export async function createContract(data: InsertContract): Promise<Contract> {
  const result = await db.insert(contractsTable).values(data).returning();
  return result[0]!;
}

export async function findContractById(id: string): Promise<Contract | undefined> {
  const result = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, id))
    .limit(1);
  return result[0];
}

export async function getContractsByUser(userId: string): Promise<Contract[]> {
  return db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.userId, userId))
    .orderBy(desc(contractsTable.createdAt));
}

export async function updateContractStatus(
  contractId: string,
  status: Contract["status"],
): Promise<void> {
  await db
    .update(contractsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(contractsTable.id, contractId));
}

export async function updateContractStreamChannel(
  contractId: string,
  streamChannelId: string,
): Promise<void> {
  await db
    .update(contractsTable)
    .set({ streamChannelId, updatedAt: new Date() })
    .where(eq(contractsTable.id, contractId));
}

export async function deleteContract(contractId: string): Promise<void> {
  await db.delete(contractsTable).where(eq(contractsTable.id, contractId));
}

export async function updateContractPaymentLink(
  contractId: string,
  paymentLinkId: string,
  paymentLinkUrl: string,
): Promise<void> {
  await db
    .update(contractsTable)
    .set({
      streamPayPaymentLinkId: paymentLinkId,
      streamPayPaymentLinkUrl: paymentLinkUrl,
      updatedAt: new Date(),
    })
    .where(eq(contractsTable.id, contractId));
}
