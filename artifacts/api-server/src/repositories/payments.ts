import { eq, desc } from "drizzle-orm";
import {
  db,
  paymentsTable,
  type InsertPayment,
  type Payment,
} from "@workspace/db";

export async function createPayment(data: InsertPayment): Promise<Payment> {
  const result = await db.insert(paymentsTable).values(data).returning();
  return result[0]!;
}

export async function findPaymentByStreamPayId(streamPayId: string): Promise<Payment | undefined> {
  const result = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.streamPayId, streamPayId))
    .limit(1);
  return result[0];
}

export async function getPaymentsByContract(contractId: string): Promise<Payment[]> {
  return db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.contractId, contractId))
    .orderBy(desc(paymentsTable.createdAt));
}

export async function updatePaymentStatus(
  paymentId: string,
  status: Payment["status"],
  paidAt?: Date,
): Promise<void> {
  await db
    .update(paymentsTable)
    .set({ status, paidAt: paidAt ?? new Date(), updatedAt: new Date() })
    .where(eq(paymentsTable.id, paymentId));
}
