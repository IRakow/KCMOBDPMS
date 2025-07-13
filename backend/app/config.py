"""
Application configuration settings
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, validator, Field
from typing import Union


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Property Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        # Build PostgreSQL URL if components are provided
        if values.get("POSTGRES_USER") and values.get("POSTGRES_PASSWORD") and values.get("POSTGRES_DB"):
            return PostgresDsn.build(
                scheme="postgresql",
                username=values.get("POSTGRES_USER"),
                password=values.get("POSTGRES_PASSWORD"),
                host=values.get("POSTGRES_HOST"),
                port=values.get("POSTGRES_PORT"),
                path=f"/{values.get('POSTGRES_DB') or ''}",
            )
        # Default to SQLite for development
        return "sqlite:///./property_mgmt.db"
    
    # Security settings
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://localhost:5173",  # Vite default
        "http://localhost:5174",  # Vite alternative
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Email settings (for notifications)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_UPLOAD_EXTENSIONS: set[str] = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
    
    # Pagination settings
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # AI Services API Keys
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()