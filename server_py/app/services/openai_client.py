"""OpenAI client for generating reports and chat responses."""
import json
from typing import Dict, Any
from openai import AsyncOpenAI
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

from app.config import settings


class RateLimitError(Exception):
    """Exception for rate limit errors."""
    pass


def is_rate_limit_error(exception: Exception) -> bool:
    """Check if error is a rate limit error."""
    error_msg = str(exception).lower()
    return (
        "429" in error_msg or
        "ratelimit_exceeded" in error_msg or
        "quota" in error_msg or
        "rate limit" in error_msg
    )


class OpenAIClient:
    """Client for OpenAI API interactions."""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            base_url=settings.AI_INTEGRATIONS_OPENAI_BASE_URL,
            api_key=settings.AI_INTEGRATIONS_OPENAI_API_KEY
        )
    
    @retry(
        stop=stop_after_attempt(7),
        wait=wait_exponential(multiplier=2, min=2, max=128),
        retry=retry_if_exception_type(RateLimitError)
    )
    async def generate_report_with_ai(
        self,
        user_request: str,
        fhir_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate a report using AI with aggregated FHIR data."""
        
        # Log data sizes
        data_size = len(json.dumps(fhir_data))
        print(f"[AI] Generating report for request: '{user_request}'")
        print(f"[AI] Aggregated FHIR data size: {data_size} characters")
        
        patients_count = fhir_data.get("patients", {}).get("totalCount", 0)
        observations_count = fhir_data.get("observations", {}).get("totalCount", 0)
        conditions_count = fhir_data.get("conditions", {}).get("totalCount", 0)
        
        print(f"[AI] Data summary: patients={patients_count}, observations={observations_count}, conditions={conditions_count}")
        
        prompt = f"""You are a healthcare data analyst creating interactive Power BI-style dashboards. A user has requested: "{user_request}"

AGGREGATED FHIR DATA:
{json.dumps(fhir_data, indent=2)}

IMPORTANT: This is pre-aggregated data from a FHIR dataset. The available data includes:
- Patients: {patients_count} records
- Observations: {observations_count} records  
- Conditions: {conditions_count} records

CRITICAL INSTRUCTION: Generate a comprehensive report using ALL available data, even if some data types are missing or have zero records. 
- If patient data exists, create demographics charts (age/gender distribution) and patient metrics
- If condition data exists, create condition prevalence charts and condition metrics
- If observation data exists, create observation category charts and observation metrics
- ALWAYS generate at least 3-4 metrics and 2-3 charts from the available data
- If a specific data type has zero records, simply exclude charts/metrics that require that data type

Use the aggregated data to perform population-level health analysis on the available records.

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
{{
  "title": "Report Title (n=500)",
  "content": "Detailed analysis...",
  "metrics": [
    {{ 
      "label": "Total Patients", 
      "value": "500", 
      "description": "Number of patients in cohort",
      "unit": "patients",
      "icon": "users"
    }}
  ],
  "chartData": [
    {{
      "id": "chart1",
      "title": "Age Distribution",
      "type": "bar",
      "description": "Patient age group distribution",
      "data": [{{"name": "0-18", "value": 75, "percentage": 15}}],
      "xAxis": {{"label": "Age Group", "type": "category"}},
      "yAxis": {{"label": "Patient Count", "type": "value", "unit": "patients"}},
      "legend": {{"show": true, "position": "top"}}
    }}
  ],
  "filters": [
    {{
      "id": "gender",
      "label": "Gender",
      "type": "multiselect",
      "field": "gender",
      "options": [
        {{"label": "Male", "value": "male", "count": 250}},
        {{"label": "Female", "value": "female", "count": 250}}
      ]
    }},
    {{
      "id": "ageGroup",
      "label": "Age Group",
      "type": "multiselect",
      "field": "ageGroup",
      "options": [
        {{"label": "0-18", "value": "0-18", "count": 75}},
        {{"label": "19-30", "value": "19-30", "count": 100}}
      ]
    }}
  ],
  "layout": {{
    "columns": 12,
    "rowHeight": 80,
    "tiles": [
      {{"i": "narrative", "x": 0, "y": 0, "w": 12, "h": 2, "type": "narrative"}},
      {{"i": "metric-0", "x": 0, "y": 2, "w": 3, "h": 1, "type": "metric"}},
      {{"i": "chart-0", "x": 0, "y": 3, "w": 6, "h": 4, "type": "chart", "chartId": "chart1"}}
    ]
  }}
}}"""
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-5",  # Using gpt-5 as specified in original code
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=8192
            )
            
            content = response.choices[0].message.content or "{}"
            print("[AI] Response received, parsing JSON...")
            
            try:
                result = json.loads(content)
                print("[AI] Successfully parsed AI response")
            except json.JSONDecodeError as parse_error:
                print(f"[AI] Failed to parse AI response as JSON: {parse_error}")
                print(f"[AI] Raw response content (first 500 chars): {content[:500]}")
                raise ValueError("Failed to parse AI response as valid JSON")
            
            report = {
                "title": result.get("title", "Healthcare Report"),
                "content": result.get("content", "No analysis available."),
                "chartData": result.get("chartData", []),
                "metrics": result.get("metrics", []),
                "filters": result.get("filters", []),
                "layout": result.get("layout", {})
            }
            
            print(f"[AI] Report generated: title={report['title']}, "
                  f"contentLength={len(report['content'])}, "
                  f"metricsCount={len(report['metrics'])}, "
                  f"chartsCount={len(report['chartData'])}")
            
            return report
            
        except Exception as error:
            print(f"[AI] Error generating report: {error}")
            if is_rate_limit_error(error):
                raise RateLimitError(str(error))
            raise
    
    async def generate_chat_response(
        self,
        user_message: str,
        report_summary: str
    ) -> str:
        """Generate a friendly chat response."""
        try:
            prompt = f"""You are a helpful healthcare AI assistant. The user asked: "{user_message}"

You've generated a report titled: "{report_summary}"

Provide a brief, friendly response (1-2 sentences) confirming what you've done and summarizing the key findings."""
            
            response = await self.client.chat.completions.create(
                model="gpt-5",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            
            return response.choices[0].message.content or "I've generated your report. Please review the details above."
            
        except Exception as error:
            print(f"Error generating chat response: {error}")
            return "I've generated your healthcare report based on the FHIR data. Check out the visualizations and metrics!"


# Global OpenAI client instance
openai_client = OpenAIClient()
