import { pgTable, uuid, real, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { contractsTable } from "./contracts";

export const severityEnum = pgEnum("severity_level", ["Low", "Medium", "High"]);

export const auditResultsTable = pgTable("audit_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contractsTable.id, { onDelete: "cascade" }),
  riskScore: real("risk_score").notNull().default(0),
  severity: severityEnum("severity").notNull().default("Low"),
  inspectorOutput: text("inspector_output").notNull().default(""),
  lawFinderOutput: text("law_finder_output").notNull().default(""),
  drafterOutput: text("drafter_output").notNull().default(""),
  n8nRawResponse: text("n8n_raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditResultSchema = createInsertSchema(auditResultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAuditResultSchema = createSelectSchema(auditResultsTable);

export type InsertAuditResult = z.infer<typeof insertAuditResultSchema>;
export type AuditResult = typeof auditResultsTable.$inferSelect;
