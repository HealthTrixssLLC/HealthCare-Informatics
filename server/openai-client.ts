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
          const prompt = `You are a healthcare data analyst. A user has requested: "${userRequest}"

FHIR Data Available:
${JSON.stringify(fhirData, null, 2)}

Generate a comprehensive healthcare report based on this request and the FHIR data. Analyze the data and provide:
1. A clear, professional title for the report
2. A detailed analysis with insights (2-3 paragraphs)
3. Key metrics (4 metrics with labels, values, and optional trends)
4. Chart data for visualizations (suggest 2-3 charts based on the data)

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
          const result = JSON.parse(content);

          return {
            title: result.title || "Healthcare Report",
            content: result.content || "No analysis available.",
            chartData: result.chartData || [],
            metrics: result.metrics || [],
          };
        } catch (error: any) {
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
