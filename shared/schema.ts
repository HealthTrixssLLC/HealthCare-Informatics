import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Message types for chat interface
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Report schema
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  chartData: jsonb("chart_data"),
  metrics: jsonb("metrics"),
  fhirQuery: text("fhir_query"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  generatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// TypeScript interfaces for frontend use
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ReportData {
  id: string;
  title: string;
  content: string;
  chartData?: ChartDataSet[];
  metrics?: MetricCard[];
  fhirQuery?: string;
  generatedAt: string;
}

export interface ChartDataSet {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: ChartDataPoint[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MetricCard {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  description?: string;
}

// FHIR Resource types
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  name?: Array<{ given?: string[]; family?: string }>;
  gender?: string;
  birthDate?: string;
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: string;
  code?: { text?: string };
  valueQuantity?: { value?: number; unit?: string };
  effectiveDateTime?: string;
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  code?: { text?: string };
  clinicalStatus?: { coding?: Array<{ code?: string }> };
  onsetDateTime?: string;
}
