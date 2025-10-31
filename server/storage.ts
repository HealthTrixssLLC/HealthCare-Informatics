import { type InsertMessage, type Message, type InsertReport, type Report, type ChatSession, type InsertChatSession, type FHIRCache } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Chat Sessions
  createSession(session: InsertChatSession): Promise<ChatSession>;
  getSessions(): Promise<ChatSession[]>;
  getSessionById(id: string): Promise<ChatSession | undefined>;
  updateSessionTimestamp(id: string): Promise<void>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  
  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  getReportById(id: string): Promise<Report | undefined>;
  getReportsBySessionId(sessionId: string): Promise<Report[]>;
  
  // FHIR Cache
  getCachedFHIRData(cacheKey: string): Promise<any | null>;
  setCachedFHIRData(cacheKey: string, data: any, ttlMinutes: number): Promise<void>;
  cleanExpiredCache(): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;
  private reports: Map<string, Report>;
  private fhirCache: Map<string, FHIRCache>;
  private lastCacheCleanup: number = 0;
  private readonly CLEANUP_INTERVAL_MS = 60000; // Clean every 60 seconds

  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
    this.reports = new Map();
    this.fhirCache = new Map();
  }

  // Chat Sessions
  async createSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getSessionById(id: string): Promise<ChatSession | undefined> {
    return this.sessions.get(id);
  }

  async updateSessionTimestamp(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.updatedAt = new Date();
      this.sessions.set(id, session);
    }
  }

  // Messages
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    await this.updateSessionTimestamp(insertMessage.sessionId);
    return message;
  }

  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      id,
      sessionId: insertReport.sessionId,
      title: insertReport.title,
      summary: insertReport.summary || null,
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

  async getReportsBySessionId(sessionId: string): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.sessionId === sessionId)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  // FHIR Cache
  async getCachedFHIRData(cacheKey: string): Promise<any | null> {
    // Only clean periodically to avoid O(n) on every read
    const now = Date.now();
    if (now - this.lastCacheCleanup > this.CLEANUP_INTERVAL_MS) {
      await this.cleanExpiredCache();
      this.lastCacheCleanup = now;
    }
    
    const cached = Array.from(this.fhirCache.values()).find(
      cache => cache.cacheKey === cacheKey
    );
    if (!cached) return null;
    if (cached.expiresAt < new Date()) {
      this.fhirCache.delete(cached.id);
      return null;
    }
    return cached.data;
  }

  async setCachedFHIRData(cacheKey: string, data: any, ttlMinutes: number): Promise<void> {
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const cache: FHIRCache = {
      id,
      cacheKey,
      data,
      expiresAt,
      createdAt: new Date(),
    };
    
    // Remove existing cache with same key
    const existing = Array.from(this.fhirCache.values()).find(c => c.cacheKey === cacheKey);
    if (existing) {
      this.fhirCache.delete(existing.id);
    }
    
    this.fhirCache.set(id, cache);
  }

  async cleanExpiredCache(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.fhirCache.entries());
    for (const [id, cache] of entries) {
      if (cache.expiresAt < now) {
        this.fhirCache.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
