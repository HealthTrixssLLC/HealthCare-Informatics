"""Storage abstraction for sessions, messages, reports, and cache."""
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from uuid import uuid4
import json

from app.models import (
    ChatSession, ChatSessionCreate,
    Message, MessageCreate,
    Report, ReportCreate
)


class IStorage(ABC):
    """Abstract storage interface."""
    
    @abstractmethod
    async def create_session(self, session: ChatSessionCreate) -> ChatSession:
        """Create a new chat session."""
        pass
    
    @abstractmethod
    async def get_sessions(self) -> List[ChatSession]:
        """Get all chat sessions."""
        pass
    
    @abstractmethod
    async def get_session_by_id(self, session_id: str) -> Optional[ChatSession]:
        """Get a session by ID."""
        pass
    
    @abstractmethod
    async def update_session_timestamp(self, session_id: str) -> None:
        """Update session timestamp."""
        pass
    
    @abstractmethod
    async def create_message(self, message: MessageCreate) -> Message:
        """Create a new message."""
        pass
    
    @abstractmethod
    async def get_messages_by_session_id(self, session_id: str) -> List[Message]:
        """Get all messages for a session."""
        pass
    
    @abstractmethod
    async def create_report(self, report: ReportCreate) -> Report:
        """Create a new report."""
        pass
    
    @abstractmethod
    async def get_reports(self) -> List[Report]:
        """Get all reports."""
        pass
    
    @abstractmethod
    async def get_report_by_id(self, report_id: str) -> Optional[Report]:
        """Get a report by ID."""
        pass
    
    @abstractmethod
    async def get_reports_by_session_id(self, session_id: str) -> List[Report]:
        """Get all reports for a session."""
        pass
    
    @abstractmethod
    async def get_cached_fhir_data(self, cache_key: str) -> Optional[Any]:
        """Get cached FHIR data."""
        pass
    
    @abstractmethod
    async def set_cached_fhir_data(self, cache_key: str, data: Any, ttl_minutes: int) -> None:
        """Set cached FHIR data."""
        pass
    
    @abstractmethod
    async def clean_expired_cache(self) -> None:
        """Clean expired cache entries."""
        pass


class MemStorage(IStorage):
    """In-memory storage implementation."""
    
    def __init__(self):
        self.sessions: Dict[str, ChatSession] = {}
        self.messages: Dict[str, Message] = {}
        self.reports: Dict[str, Report] = {}
        self.fhir_cache: Dict[str, Dict[str, Any]] = {}
        self.last_cache_cleanup: datetime = datetime.utcnow()
        self.cleanup_interval_seconds = 60
    
    async def create_session(self, session_data: ChatSessionCreate) -> ChatSession:
        session = ChatSession(
            id=str(uuid4()),
            title=session_data.title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            message_count=0
        )
        self.sessions[session.id] = session
        return session
    
    async def get_sessions(self) -> List[ChatSession]:
        sessions = sorted(
            self.sessions.values(),
            key=lambda s: s.updated_at,
            reverse=True
        )
        return list(sessions)
    
    async def get_session_by_id(self, session_id: str) -> Optional[ChatSession]:
        return self.sessions.get(session_id)
    
    async def update_session_timestamp(self, session_id: str) -> None:
        if session_id in self.sessions:
            self.sessions[session_id].updated_at = datetime.utcnow()
    
    async def create_message(self, message_data: MessageCreate) -> Message:
        message = Message(
            id=str(uuid4()),
            session_id=message_data.session_id,
            role=message_data.role,
            content=message_data.content,
            timestamp=datetime.utcnow()
        )
        self.messages[message.id] = message
        await self.update_session_timestamp(message_data.session_id)
        
        # Update message count
        if message_data.session_id in self.sessions:
            messages = await self.get_messages_by_session_id(message_data.session_id)
            self.sessions[message_data.session_id].message_count = len(messages)
        
        return message
    
    async def get_messages_by_session_id(self, session_id: str) -> List[Message]:
        messages = [
            msg for msg in self.messages.values()
            if msg.session_id == session_id
        ]
        return sorted(messages, key=lambda m: m.timestamp)
    
    async def create_report(self, report_data: ReportCreate) -> Report:
        report = Report(
            id=str(uuid4()),
            **report_data.model_dump(),
            generated_at=datetime.utcnow()
        )
        self.reports[report.id] = report
        return report
    
    async def get_reports(self) -> List[Report]:
        reports = sorted(
            self.reports.values(),
            key=lambda r: r.generated_at,
            reverse=True
        )
        return list(reports)
    
    async def get_report_by_id(self, report_id: str) -> Optional[Report]:
        return self.reports.get(report_id)
    
    async def get_reports_by_session_id(self, session_id: str) -> List[Report]:
        reports = [
            report for report in self.reports.values()
            if report.session_id == session_id
        ]
        return sorted(reports, key=lambda r: r.generated_at, reverse=True)
    
    async def get_cached_fhir_data(self, cache_key: str) -> Optional[Any]:
        # Periodic cleanup
        now = datetime.utcnow()
        if (now - self.last_cache_cleanup).seconds > self.cleanup_interval_seconds:
            await self.clean_expired_cache()
            self.last_cache_cleanup = now
        
        if cache_key in self.fhir_cache:
            cache_entry = self.fhir_cache[cache_key]
            if cache_entry["expires_at"] > datetime.utcnow():
                return cache_entry["data"]
            else:
                del self.fhir_cache[cache_key]
        return None
    
    async def set_cached_fhir_data(self, cache_key: str, data: Any, ttl_minutes: int) -> None:
        expires_at = datetime.utcnow() + timedelta(minutes=ttl_minutes)
        self.fhir_cache[cache_key] = {
            "data": data,
            "expires_at": expires_at,
            "created_at": datetime.utcnow()
        }
    
    async def clean_expired_cache(self) -> None:
        now = datetime.utcnow()
        expired_keys = [
            key for key, entry in self.fhir_cache.items()
            if entry["expires_at"] < now
        ]
        for key in expired_keys:
            del self.fhir_cache[key]


# Global storage instance
storage: IStorage = MemStorage()
