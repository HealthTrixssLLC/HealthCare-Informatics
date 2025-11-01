"""Pydantic models for request/response validation."""
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from uuid import uuid4


# Chat Session Models
class ChatSessionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)


class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count: Optional[int] = 0


# Message Models
class MessageCreate(BaseModel):
    session_id: str
    role: Literal["user", "assistant"]
    content: str


class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Report Models
class FilterOption(BaseModel):
    label: str
    value: Any
    count: Optional[int] = None


class FilterDefinition(BaseModel):
    id: str
    label: str
    type: Literal["select", "multiselect", "daterange", "numberrange", "search"]
    field: str
    options: Optional[List[FilterOption]] = None
    default_value: Optional[Any] = None
    description: Optional[str] = None


class AxisConfig(BaseModel):
    label: Optional[str] = None
    type: Optional[Literal["category", "value", "time", "log"]] = "category"
    min: Optional[float] = None
    max: Optional[float] = None
    unit: Optional[str] = None


class ChartDataPoint(BaseModel):
    name: str
    value: float
    percentage: Optional[float] = None


class ChartDataSet(BaseModel):
    id: str
    title: str
    type: Literal["bar", "line", "pie", "area", "scatter", "heatmap", "treemap", "funnel", "gauge"]
    data: List[ChartDataPoint]
    x_axis: Optional[AxisConfig] = None
    y_axis: Optional[AxisConfig] = None
    description: Optional[str] = None


class MetricTrend(BaseModel):
    direction: Literal["up", "down"]
    percentage: float


class MetricCard(BaseModel):
    label: str
    value: Any
    trend: Optional[MetricTrend] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    icon: Optional[str] = None


class LayoutTile(BaseModel):
    i: str
    x: int
    y: int
    w: int
    h: int
    min_w: Optional[int] = None
    min_h: Optional[int] = None
    type: Literal["chart", "metric", "narrative"]
    chart_id: Optional[str] = None


class DashboardLayout(BaseModel):
    tiles: List[LayoutTile]
    columns: Optional[int] = 12
    row_height: Optional[int] = 80


class PatientAggregate(BaseModel):
    id: str
    gender: Optional[str] = None
    age_group: Optional[str] = None
    age: Optional[int] = None
    birth_date: Optional[str] = None


class ObservationAggregate(BaseModel):
    id: str
    patient_id: Optional[str] = None
    category: Optional[str] = None
    code: Optional[str] = None
    display: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    date: Optional[str] = None


class ConditionAggregate(BaseModel):
    id: str
    patient_id: Optional[str] = None
    code: Optional[str] = None
    display: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    onset_date: Optional[str] = None


class DemographicSummary(BaseModel):
    total_patients: int
    gender_distribution: Dict[str, int]
    age_groups: Dict[str, int]
    average_age: Optional[float] = None
    median_age: Optional[int] = None


class DatasetMetadata(BaseModel):
    generated_at: str
    patient_count: int
    observation_count: int
    condition_count: int
    data_source: str


class SourceDataset(BaseModel):
    patients: Optional[List[PatientAggregate]] = None
    observations: Optional[List[ObservationAggregate]] = None
    conditions: Optional[List[ConditionAggregate]] = None
    demographics: Optional[DemographicSummary] = None
    metadata: Optional[DatasetMetadata] = None


class ReportCreate(BaseModel):
    session_id: str
    title: str
    summary: Optional[str] = None
    content: str
    chart_data: Optional[List[ChartDataSet]] = None
    metrics: Optional[List[MetricCard]] = None
    fhir_query: Optional[str] = None
    source_data: Optional[SourceDataset] = None
    aggregated_data: Optional[Dict[str, Any]] = None
    filters: Optional[List[FilterDefinition]] = None
    layout: Optional[DashboardLayout] = None
    data_fetched_at: Optional[datetime] = None
    data_source: Optional[Literal["live", "cached"]] = None


class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    title: str
    summary: Optional[str] = None
    content: str
    chart_data: Optional[List[ChartDataSet]] = None
    metrics: Optional[List[MetricCard]] = None
    fhir_query: Optional[str] = None
    source_data: Optional[SourceDataset] = None
    aggregated_data: Optional[Dict[str, Any]] = None
    filters: Optional[List[FilterDefinition]] = None
    layout: Optional[DashboardLayout] = None
    data_fetched_at: Optional[datetime] = None
    data_source: Optional[Literal["live", "cached"]] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    session_title: Optional[str] = None


class GenerateReportRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: str
    use_cache: bool = False


class GenerateReportResponse(BaseModel):
    report: Report
    assistant_message: str


class HealthResponse(BaseModel):
    status: str
    fhir_server: str
