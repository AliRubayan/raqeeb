import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const contractStatusEnum = pgEnum("contract_status", [
  "Paid",
  "Analyzing",
  "Ready",
  "Completed",
  "Rejected",
]);

export const contractsTable = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  contractName: text("contract_name").notNull(),
  status: contractStatusEnum("status").notNull().default("Paid"),
  contractText: text("contract_text").notNull(),
  streamChannelId: text("stream_channel_id"),
  streamPayPaymentLinkId: text("streampay_payment_link_id"),
  streamPayPaymentLinkUrl: text("streampay_payment_link_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectContractSchema = createSelectSchema(contractsTable);

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;
