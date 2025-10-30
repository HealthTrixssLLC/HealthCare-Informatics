import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fhirClient } from "./fhir-client";
import { generateReportWithAI, generateChatResponse } from "./openai-client";
import { z } from "zod";

const generateReportSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
});

export async function registerRoutes(app: Express): Promise<Server> {
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

      const { message } = validationResult.data;

      // Determine what FHIR data to fetch based on the message
      const messageLower = message.toLowerCase();
      let fhirData: any = {};

      // Fetch relevant FHIR resources
      if (messageLower.includes('patient')) {
        fhirData.patients = await fhirClient.getPatients(20);
      }
      
      if (messageLower.includes('observation') || messageLower.includes('vital') || messageLower.includes('measurement')) {
        fhirData.observations = await fhirClient.getObservations(50);
      }
      
      if (messageLower.includes('condition') || messageLower.includes('diagnosis')) {
        fhirData.conditions = await fhirClient.getConditions(50);
      }

      // If no specific resource mentioned, fetch all
      if (Object.keys(fhirData).length === 0) {
        const [patients, observations, conditions] = await Promise.all([
          fhirClient.getPatients(15),
          fhirClient.getObservations(30),
          fhirClient.getConditions(30),
        ]);
        fhirData = { patients, observations, conditions };
      }

      // Generate report using AI
      const aiReport = await generateReportWithAI(message, fhirData);

      // Create and store the report
      const report = await storage.createReport({
        title: aiReport.title,
        content: aiReport.content,
        chartData: aiReport.chartData,
        metrics: aiReport.metrics,
        fhirQuery: message,
      });

      // Store user message
      await storage.createMessage({
        role: 'user',
        content: message,
      });

      // Generate friendly chat response
      const assistantMessage = await generateChatResponse(message, aiReport.title);

      // Store assistant message
      await storage.createMessage({
        role: 'assistant',
        content: assistantMessage,
      });

      res.json({
        report: {
          id: report.id,
          title: report.title,
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

  // Get all reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports.map(r => ({
        ...r,
        generatedAt: r.generatedAt.toISOString(),
      })));
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  // Get single report
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({
        ...report,
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
