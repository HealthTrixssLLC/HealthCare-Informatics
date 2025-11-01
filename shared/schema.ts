import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chat session schema
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

// Message types for chat interface
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
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

// FHIR data cache schema
export const fhirCache = pgTable("fhir_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cacheKey: text("cache_key").notNull().unique(),
  data: jsonb("data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FHIRCache = typeof fhirCache.$inferSelect;

// Report schema
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content").notNull(),
  chartData: jsonb("chart_data"),
  metrics: jsonb("metrics"),
  fhirQuery: text("fhir_query"),
  sourceData: jsonb("source_data"),
  aggregatedData: jsonb("aggregated_data"),  // Cached aggregated FHIR data for AI processing
  filters: jsonb("filters"),
  layout: jsonb("layout"),
  dataFetchedAt: timestamp("data_fetched_at"),
  dataSource: text("data_source"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  generatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// TypeScript interfaces for frontend use
export interface ChatSessionData {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ReportData {
  id: string;
  sessionId: string;
  title: string;
  summary?: string;
  content: string;
  chartData?: ChartDataSet[];
  metrics?: MetricCard[];
  fhirQuery?: string;
  generatedAt: string;
  sessionTitle?: string;
  filters?: FilterDefinition[];
  layout?: DashboardLayout;
  sourceData?: SourceDataset;
  dataFetchedAt?: string;
  dataSource?: 'live' | 'cached';
}

export interface FilterDefinition {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'numberrange' | 'search';
  field: string;
  options?: FilterOption[];
  defaultValue?: any;
  description?: string;
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface DashboardLayout {
  tiles: LayoutTile[];
  columns?: number;
  rowHeight?: number;
}

export interface LayoutTile {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  type: 'chart' | 'metric' | 'narrative';
  chartId?: string;
}

export interface SourceDataset {
  patients?: PatientAggregate[];
  observations?: ObservationAggregate[];
  conditions?: ConditionAggregate[];
  demographics?: DemographicSummary;
  metadata?: DatasetMetadata;
}

export interface PatientAggregate {
  id: string;
  gender?: string;
  ageGroup?: string;
  age?: number;
  birthDate?: string;
}

export interface ObservationAggregate {
  id: string;
  patientId?: string;
  category?: string;
  code?: string;
  display?: string;
  value?: number;
  unit?: string;
  date?: string;
}

export interface ConditionAggregate {
  id: string;
  patientId?: string;
  code?: string;
  display?: string;
  severity?: string;
  category?: string;
  onsetDate?: string;
}

export interface DemographicSummary {
  totalPatients: number;
  genderDistribution: Record<string, number>;
  ageGroups: Record<string, number>;
  averageAge?: number;
  medianAge?: number;
}

export interface DatasetMetadata {
  generatedAt: string;
  patientCount: number;
  observationCount: number;
  conditionCount: number;
  dataSource: string;
}

export interface ChartDataSet {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'treemap' | 'funnel' | 'gauge';
  data: ChartDataPoint[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series?: SeriesConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  drilldown?: DrilldownConfig;
  description?: string;
}

export interface AxisConfig {
  label?: string;
  type?: 'category' | 'value' | 'time' | 'log';
  min?: number;
  max?: number;
  unit?: string;
}

export interface SeriesConfig {
  name: string;
  type?: 'bar' | 'line' | 'scatter' | 'pie';
  dataKey: string;
  color?: string;
  stack?: string;
  smooth?: boolean;
}

export interface TooltipConfig {
  formatter?: string;
  shared?: boolean;
}

export interface LegendConfig {
  show?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orient?: 'horizontal' | 'vertical';
}

export interface DrilldownConfig {
  enabled: boolean;
  levels?: string[];
  dataKey?: string;
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
  unit?: string;
  icon?: string;
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
