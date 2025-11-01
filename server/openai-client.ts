import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry from "p-retry";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// Reference: blueprint:javascript_openai_ai_integrations
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

export async function generateReportWithAI(
  userRequest: string,
  fhirData: any
): Promise<{ title: string; content: string; chartData: any[]; metrics: any[] }> {
  const limit = pLimit(1);

  return limit(() =>
    pRetry(
      async () => {
        try {
          // Log data sizes to understand if we're sending too much data
          const dataSize = JSON.stringify(fhirData).length;
          console.log(`[AI] Generating report for request: "${userRequest}"`);
          console.log(`[AI] Aggregated FHIR data size: ${dataSize} characters`);
          console.log(`[AI] Data summary:`, {
            patients: fhirData.patients?.totalCount || 0,
            observations: fhirData.observations?.totalCount || 0,
            conditions: fhirData.conditions?.totalCount || 0
          });

          const prompt = `You are a healthcare data analyst. A user has requested: "${userRequest}"

AGGREGATED FHIR DATA:
${JSON.stringify(fhirData, null, 2)}

IMPORTANT: This is pre-aggregated data from a comprehensive FHIR dataset containing:
- Patient demographics with age/gender distributions
- Observation statistics by category and frequency
- Condition prevalence and severity data
- Sample records for context

The aggregated data represents the full population in the FHIR server (500-1000 patients, 1000-2000 observations/conditions).
Use this aggregated data to perform population-level health analysis.

Generate a comprehensive healthcare report based on this request and the aggregated FHIR data. Provide:
1. A clear, professional title for the report
2. A detailed analysis with insights (2-3 paragraphs) that leverages the aggregated statistics for population health insights, trends, and patterns
3. Key metrics (4 metrics with labels, values, and descriptions) - use the provided statistics
4. Chart data for visualizations (2-3 charts) - create visualizations from the aggregated data

Your analysis should include:
- Population-level statistics and demographic insights
- Health trends identified from observation and condition data
- Statistically significant patterns in the data
- Comparative analysis across patient groups (age, gender, etc.)

Respond in JSON format:
{
  "title": "Report Title",
  "content": "Detailed analysis...",
  "metrics": [
    { "label": "Metric Name", "value": "123", "description": "Brief description" }
  ],
  "chartData": [
    {
      "id": "chart1",
      "title": "Chart Title",
      "type": "bar|line|pie|area",
      "data": [{"name": "Category", "value": 10}]
    }
  ]
}`;

          // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_completion_tokens: 8192,
          });

          const content = response.choices[0]?.message?.content || "{}";
          console.log(`[AI] Response received, parsing JSON...`);
          
          let result;
          try {
            result = JSON.parse(content);
            console.log(`[AI] Successfully parsed AI response`);
          } catch (parseError) {
            console.error('[AI] Failed to parse AI response as JSON:', parseError);
            console.error('[AI] Raw response content:', content.substring(0, 500));
            throw new Error('Failed to parse AI response');
          }

          const report = {
            title: result.title || "Healthcare Report",
            content: result.content || "No analysis available.",
            chartData: result.chartData || [],
            metrics: result.metrics || [],
          };

          console.log(`[AI] Report generated:`, {
            title: report.title,
            contentLength: report.content.length,
            metricsCount: report.metrics.length,
            chartsCount: report.chartData.length
          });

          return report;
        } catch (error: any) {
          console.error('[AI] Error generating report:', error.message);
          if (error.response) {
            console.error('[AI] Error response:', error.response.data);
          }
          if (isRateLimitError(error)) {
            throw error;
          }
          // For non-rate-limit errors, don't retry
          throw error;
        }
      },
      {
        retries: 7,
        minTimeout: 2000,
        maxTimeout: 128000,
        factor: 2,
      }
    )
  );
}

export async function generateChatResponse(
  userMessage: string,
  reportSummary: string
): Promise<string> {
  try {
    const prompt = `You are a helpful healthcare AI assistant. The user asked: "${userMessage}"

You've generated a report titled: "${reportSummary}"

Provide a brief, friendly response (1-2 sentences) confirming what you've done and summarizing the key findings.`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 200,
    });

    return response.choices[0]?.message?.content || "I've generated your report. Please review the details above.";
  } catch (error) {
    console.error('Error generating chat response:', error);
    return "I've generated your healthcare report based on the FHIR data. Check out the visualizations and metrics!";
  }
}
