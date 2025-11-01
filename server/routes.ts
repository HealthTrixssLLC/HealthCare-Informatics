import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fhirClient } from "./fhir-client";
import { generateReportWithAI, generateChatResponse } from "./openai-client";
import { aggregateFHIRData } from "./fhir-aggregator";
import { z } from "zod";
import { insertChatSessionSchema } from "@shared/schema";

const generateReportSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
  sessionId: z.string().min(1, "Session ID is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new chat session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validationResult = insertChatSessionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request',
          details: validationResult.error.issues 
        });
      }

      const session = await storage.createSession(validationResult.data);
      
      res.json({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  // Get all chat sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      
      // Include message count for each session
      const sessionsWithCount = await Promise.all(
        sessions.map(async (session) => {
          const messages = await storage.getMessagesBySessionId(session.id);
          return {
            id: session.id,
            title: session.title,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
            messageCount: messages.length,
          };
        })
      );
      
      res.json(sessionsWithCount);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });

  // Get messages for a specific session
  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesBySessionId(req.params.id);
      res.json(messages.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Generate report endpoint
  app.post("/api/generate-report", async (req, res) => {
    try {
      const validationResult = generateReportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request',
          details: validationResult.error.issues 
        });
      }

      const { message, sessionId } = validationResult.data;

      // Determine what FHIR data to fetch based on the message
      const messageLower = message.toLowerCase();
      let fhirData: any = {};

      // Fetch relevant FHIR resources with comprehensive datasets
      // Using default limits: 500 patients, 1000 observations/conditions
      if (messageLower.includes('patient')) {
        fhirData.patients = await fhirClient.getPatients();
      }
      
      if (messageLower.includes('observation') || messageLower.includes('vital') || messageLower.includes('measurement')) {
        fhirData.observations = await fhirClient.getObservations();
      }
      
      if (messageLower.includes('condition') || messageLower.includes('diagnosis')) {
        fhirData.conditions = await fhirClient.getConditions();
      }

      // If no specific resource mentioned, fetch all comprehensive datasets
      if (Object.keys(fhirData).length === 0) {
        const [patients, observations, conditions] = await Promise.all([
          fhirClient.getPatients(),
          fhirClient.getObservations(),
          fhirClient.getConditions(),
        ]);
        fhirData = { patients, observations, conditions };
      }

      // Aggregate FHIR data for AI analysis (reduces data size from ~270KB to ~2-5KB)
      console.log('[Routes] Aggregating FHIR data for AI analysis...');
      const aggregatedData = aggregateFHIRData(fhirData);
      console.log('[Routes] Aggregation complete');

      // Generate report using AI with aggregated data
      const aiReport = await generateReportWithAI(message, aggregatedData);

      // Generate summary from first 150 chars of content
      const summary = aiReport.content.length > 150 
        ? aiReport.content.substring(0, 150) + '...' 
        : aiReport.content;

      // Create and store the report
      const report = await storage.createReport({
        sessionId,
        title: aiReport.title,
        summary,
        content: aiReport.content,
        chartData: aiReport.chartData,
        metrics: aiReport.metrics,
        fhirQuery: message,
      });

      // Store user message
      await storage.createMessage({
        sessionId,
        role: 'user',
        content: message,
      });

      // Generate friendly chat response
      const assistantMessage = await generateChatResponse(message, aiReport.title);

      // Store assistant message
      await storage.createMessage({
        sessionId,
        role: 'assistant',
        content: assistantMessage,
      });

      res.json({
        report: {
          id: report.id,
          sessionId: report.sessionId,
          title: report.title,
          summary: report.summary,
          content: report.content,
          chartData: report.chartData,
          metrics: report.metrics,
          fhirQuery: report.fhirQuery,
          generatedAt: report.generatedAt.toISOString(),
        },
        assistantMessage,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isFHIRError = errorMessage.includes('FHIR') || errorMessage.includes('fetch');
      const isAIError = errorMessage.includes('AI') || errorMessage.includes('OpenAI') || errorMessage.includes('rate limit');
      
      res.status(500).json({ 
        error: 'Failed to generate report',
        details: errorMessage,
        errorType: isFHIRError ? 'FHIR_ERROR' : isAIError ? 'AI_ERROR' : 'UNKNOWN_ERROR'
      });
    }
  });

  // Get all reports with session information
  app.get("/api/reports", async (req, res) => {
    try {
      const allReports = await storage.getReports();
      
      // Sort by most recent first and limit to 50
      const sortedReports = allReports
        .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
        .slice(0, 50);
      
      // Enrich reports with session titles
      const enrichedReports = await Promise.all(
        sortedReports.map(async (report) => {
          const session = await storage.getSessionById(report.sessionId);
          return {
            ...report,
            sessionTitle: session?.title,
            generatedAt: report.generatedAt.toISOString(),
          };
        })
      );
      
      res.json(enrichedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  // Get single report with session information
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      const session = await storage.getSessionById(report.sessionId);
      
      res.json({
        ...report,
        sessionTitle: session?.title,
        generatedAt: report.generatedAt.toISOString(),
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: 'ok', fhirServer: 'https://hapi.fhir.org/baseR4' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
