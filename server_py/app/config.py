"""Application configuration using Pydantic settings."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server
    PORT: int = 5000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"
    
    # FHIR Server
    FHIR_BASE_URL: str = "https://hapi.fhir.org/baseR4"
    
    # OpenAI
    AI_INTEGRATIONS_OPENAI_BASE_URL: Optional[str] = None
    AI_INTEGRATIONS_OPENAI_API_KEY: Optional[str] = None
    
    # Cache
    CACHE_TTL_MINUTES: int = 10
    REDIS_URL: Optional[str] = None
    
    # Storage
    STORAGE_TYPE: str = "memory"  # memory or postgres
    DATABASE_URL: Optional[str] = None
    
    # FHIR Limits
    DEFAULT_PATIENT_LIMIT: int = 500
    DEFAULT_OBSERVATION_LIMIT: int = 1000
    DEFAULT_CONDITION_LIMIT: int = 1000
    MAX_PATIENTS: int = 1000
    MAX_OBSERVATIONS: int = 2000
    MAX_CONDITIONS: int = 2000
    PAGE_SIZE: int = 100
    REQUEST_TIMEOUT: int = 15
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
