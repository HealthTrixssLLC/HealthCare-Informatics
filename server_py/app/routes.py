"""FastAPI routes for the healthcare informatics API."""
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from app.models import (
    ChatSession, ChatSessionCreate, Message,
    Report, GenerateReportRequest, GenerateReportResponse,
    MessageCreate, ReportCreate, HealthResponse
)
from app.services.storage import storage
from app.services.fhir_client import fhir_client
from app.services.fhir_aggregator import aggregate_fhir_data, create_source_dataset
from app.services.openai_client import openai_client

router = APIRouter(prefix="/api", tags=["healthcare"])


@router.post("/sessions", response_model=ChatSession)
async def create_session(session_data: ChatSessionCreate):
    """Create a new chat session."""
    try:
        session = await storage.create_session(session_data)
        return session
    except Exception as e:
        print(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")


@router.get("/sessions", response_model=List[ChatSession])
async def get_sessions():
    """Get all chat sessions."""
    try:
        sessions = await storage.get_sessions()
        
        # Include message count for each session
        sessions_with_count = []
        for session in sessions:
            messages = await storage.get_messages_by_session_id(session.id)
            session.message_count = len(messages)
            sessions_with_count.append(session)
        
        return sessions_with_count
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sessions")


@router.get("/sessions/{session_id}/messages", response_model=List[Message])
async def get_messages(session_id: str):
    """Get messages for a specific session."""
    try:
        messages = await storage.get_messages_by_session_id(session_id)
        return messages
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")


@router.post("/generate-report", response_model=GenerateReportResponse)
async def generate_report(request: GenerateReportRequest):
    """Generate a report from FHIR data using AI."""
    try:
        message = request.message
        session_id = request.session_id
        use_cache = request.use_cache
        
        fhir_data = {}
        source_data = None
        aggregated_data = None
        data_fetched_at = None
        data_source = "live"
        
        # Check if we should use cached data
        if use_cache:
            previous_reports = await storage.get_reports_by_session_id(session_id)
            if previous_reports:
                most_recent_report = previous_reports[0]
                if most_recent_report.source_data and most_recent_report.aggregated_data:
                    print("[Routes] Using cached FHIR data from previous report")
                    source_data = most_recent_report.source_data
                    aggregated_data = most_recent_report.aggregated_data
                    data_fetched_at = most_recent_report.data_fetched_at or most_recent_report.generated_at
                    data_source = "cached"
                else:
                    print("[Routes] No cached data available, fetching fresh data")
        
        # If not using cache or no cache available, fetch fresh data
        if not use_cache or not aggregated_data:
            message_lower = message.lower()
            
            # Determine what FHIR data to fetch
            if "patient" in message_lower:
                fhir_data["patients"] = await fhir_client.get_patients()
            
            if any(word in message_lower for word in ["observation", "vital", "measurement"]):
                fhir_data["observations"] = await fhir_client.get_observations()
            
            if any(word in message_lower for word in ["condition", "diagnosis"]):
                fhir_data["conditions"] = await fhir_client.get_conditions()
            
            # If no specific resource mentioned, fetch all
            if not fhir_data:
                patients, observations, conditions = await fhir_client.get_patients(), \
                    await fhir_client.get_observations(), \
                    await fhir_client.get_conditions()
                fhir_data = {
                    "patients": patients,
                    "observations": observations,
                    "conditions": conditions
                }
            
            data_fetched_at = datetime.utcnow()
            data_source = "live"
            
            # Aggregate FHIR data
            print("[Routes] Aggregating FHIR data for AI analysis...")
            aggregated_data = aggregate_fhir_data(fhir_data)
            print("[Routes] Aggregation complete")
            
            # Create source dataset
            print("[Routes] Creating source dataset for interactive filtering...")
            source_data = create_source_dataset(fhir_data)
            patient_count = source_data.metadata.patient_count if source_data.metadata else 0
            print(f"[Routes] Source dataset created with {patient_count} patients")
        else:
            patient_count = source_data.metadata.patient_count if source_data and source_data.metadata else 0
            print(f"[Routes] Using cached aggregated data and source dataset with {patient_count} patients")
        
        # Generate report using AI
        ai_report = await openai_client.generate_report_with_ai(message, aggregated_data)
        
        # Generate summary
        content = ai_report["content"]
        summary = content[:150] + "..." if len(content) > 150 else content
        
        # Create and store the report
        report_data = ReportCreate(
            session_id=session_id,
            title=ai_report["title"],
            summary=summary,
            content=content,
            chart_data=ai_report.get("chartData"),
            metrics=ai_report.get("metrics"),
            fhir_query=message,
            source_data=source_data,
            aggregated_data=aggregated_data,
            filters=ai_report.get("filters"),
            layout=ai_report.get("layout"),
            data_fetched_at=data_fetched_at,
            data_source=data_source
        )
        
        report = await storage.create_report(report_data)
        
        # Store user message
        await storage.create_message(MessageCreate(
            session_id=session_id,
            role="user",
            content=message
        ))
        
        # Generate friendly chat response
        assistant_message = await openai_client.generate_chat_response(message, ai_report["title"])
        
        # Store assistant message
        await storage.create_message(MessageCreate(
            session_id=session_id,
            role="assistant",
            content=assistant_message
        ))
        
        return GenerateReportResponse(
            report=report,
            assistant_message=assistant_message
        )
        
    except Exception as e:
        print(f"Error generating report: {e}")
        
        error_message = str(e)
        is_fhir_error = "FHIR" in error_message or "fetch" in error_message.lower()
        is_ai_error = "AI" in error_message or "OpenAI" in error_message or "rate limit" in error_message.lower()
        
        error_type = "FHIR_ERROR" if is_fhir_error else "AI_ERROR" if is_ai_error else "UNKNOWN_ERROR"
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to generate report",
                "details": error_message,
                "errorType": error_type
            }
        )


@router.get("/reports", response_model=List[Report])
async def get_reports():
    """Get all reports."""
    try:
        all_reports = await storage.get_reports()
        
        # Sort by most recent and limit to 50
        sorted_reports = sorted(
            all_reports,
            key=lambda r: r.generated_at,
            reverse=True
        )[:50]
        
        # Enrich with session titles
        enriched_reports = []
        for report in sorted_reports:
            session = await storage.get_session_by_id(report.session_id)
            report.session_title = session.title if session else None
            enriched_reports.append(report)
        
        return enriched_reports
    except Exception as e:
        print(f"Error fetching reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")


@router.get("/reports/{report_id}", response_model=Report)
async def get_report(report_id: str):
    """Get a single report."""
    try:
        report = await storage.get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        session = await storage.get_session_by_id(report.session_id)
        report.session_title = session.title if session else None
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching report: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch report")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        fhir_server=fhir_client.base_url
    )
