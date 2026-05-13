from pydantic import BaseModel, Field


class DemographicRecord(BaseModel):
    demographic_dimension: str
    year_month: str
    demographic_value: str
    activeUsers: int
    newUsers: int
    sessions: int
    engagedSessions: int
    eventCount: int
    userEngagementDuration: int
    date_range_start: str
    date_range_end: str


class DemographicListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    has_next: bool
    items: list[DemographicRecord]


class MetadataListResponse(BaseModel):
    items: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    data_ready: bool
    available_dimensions: list[str] = Field(default_factory=list)
    last_loaded_at: str | None = None


class ErrorResponse(BaseModel):
    detail: str
