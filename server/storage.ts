import { type InsertMessage, type Message, type InsertReport, type Report } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReportById(id: string): Promise<Report | undefined>;
}

export class MemStorage implements IStorage {
  private messages: Map<string, Message>;
  private reports: Map<string, Report>;

  constructor() {
    this.messages = new Map();
    this.reports = new Map();
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      id,
      title: insertReport.title,
      content: insertReport.content,
      chartData: insertReport.chartData || null,
      metrics: insertReport.metrics || null,
      fhirQuery: insertReport.fhirQuery || null,
      generatedAt: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort(
      (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()
    );
  }

  async getReportById(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }
}

export const storage = new MemStorage();
