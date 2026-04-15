import { eq } from "drizzle-orm";
import { db, usersTable, type InsertUser, type User } from "@workspace/db";

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  return result[0];
}

export async function findUserById(id: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return result[0];
}

export async function createUser(data: InsertUser): Promise<User> {
  const result = await db.insert(usersTable).values(data).returning();
  return result[0]!;
}

export async function hasValidPayment(userId: string): Promise<boolean> {
  const user = await findUserById(userId);
  if (!user) return false;
  return user.hasActiveSubscription;
}

export async function setActiveSubscription(
  userId: string,
  active: boolean,
): Promise<void> {
  await db
    .update(usersTable)
    .set({ hasActiveSubscription: active, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
}
