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
): Promise<{ 
  title: string; 
  content: string; 
  chartData: any[]; 
  metrics: any[];
  filters?: any[];
  layout?: any;
}> {
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

          const prompt = `You are a healthcare data analyst creating interactive Power BI-style dashboards. A user has requested: "${userRequest}"

AGGREGATED FHIR DATA:
${JSON.stringify(fhirData, null, 2)}

IMPORTANT: This is pre-aggregated data from a comprehensive FHIR dataset containing:
- Patient demographics with age/gender distributions
- Observation statistics by category and frequency
- Condition prevalence and severity data
- Sample records for context

The aggregated data represents the full population in the FHIR server (500-1000 patients, 1000-2000 observations/conditions).
Use this aggregated data to perform population-level health analysis.

Generate a comprehensive, interactive healthcare dashboard with Power BI-like visualizations. Provide:
1. A clear, professional title for the report that includes cohort size (e.g., "n=500")
2. A detailed analysis with insights (2-3 paragraphs) that leverages the aggregated statistics for population health insights, trends, and patterns
3. Key metrics (4 metrics with labels, values, descriptions, and units) - use the provided statistics
4. Rich chart configurations (3-5 charts) with enhanced options for interactivity:
   - Use varied chart types: bar, line, pie, area, scatter, treemap, funnel, gauge
   - Include axis labels, tooltips, and legend configurations
   - Provide detailed chart descriptions
5. Interactive filters for the dashboard:
   - Gender filter (multiselect)
   - Age group filter (multiselect)
   - Condition category filter (if applicable)
   - Date range filter (if temporal data exists)
6. Dashboard layout with grid positions for tiles (charts, metrics, narrative)

Your analysis should include:
- Population-level statistics and demographic insights
- Health trends identified from observation and condition data
- Statistically significant patterns in the data
- Comparative analysis across patient groups (age, gender, etc.)

Respond in JSON format:
{
  "title": "Report Title (n=500)",
  "content": "Detailed analysis...",
  "metrics": [
    { 
      "label": "Total Patients", 
      "value": "500", 
      "description": "Number of patients in cohort",
      "unit": "patients",
      "icon": "users"
    }
  ],
  "chartData": [
    {
      "id": "chart1",
      "title": "Age Distribution",
      "type": "bar",
      "description": "Patient age group distribution",
      "data": [{"name": "0-18", "value": 75, "percentage": 15}],
      "xAxis": {"label": "Age Group", "type": "category"},
      "yAxis": {"label": "Patient Count", "type": "value", "unit": "patients"},
      "legend": {"show": true, "position": "top"}
    }
  ],
  "filters": [
    {
      "id": "gender",
      "label": "Gender",
      "type": "multiselect",
      "field": "gender",
      "options": [
        {"label": "Male", "value": "male", "count": 250},
        {"label": "Female", "value": "female", "count": 250}
      ]
    },
    {
      "id": "ageGroup",
      "label": "Age Group",
      "type": "multiselect",
      "field": "ageGroup",
      "options": [
        {"label": "0-18", "value": "0-18", "count": 75},
        {"label": "19-30", "value": "19-30", "count": 100}
      ]
    }
  ],
  "layout": {
    "columns": 12,
    "rowHeight": 80,
    "tiles": [
      {"i": "narrative", "x": 0, "y": 0, "w": 12, "h": 2, "type": "narrative"},
      {"i": "metric-0", "x": 0, "y": 2, "w": 3, "h": 1, "type": "metric"},
      {"i": "chart-0", "x": 0, "y": 3, "w": 6, "h": 4, "type": "chart", "chartId": "chart1"}
    ]
  }
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
