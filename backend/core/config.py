"""
Configuration for the Visitor Management System
Using pydantic-settings for production-grade settings management
"""
import os
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Application environment types."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TEST = "test"


class Settings(BaseSettings):
    """
    Centralized application configuration.
    Loads from environment variables and applies defaults.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # ==========================
    # Application Basics
    # ==========================
    app_env: Environment = Field(default=Environment.DEVELOPMENT)
    project_name: str = Field(default="Visitor Management System")
    version: str = Field(default="1.0.0")
    debug: bool = Field(default=True)
    
    # ==========================
    # API Settings
    # ==========================
    api_v1_str: str = Field(default="/api")
    allowed_origins: str = Field(default="*")
    
    # ==========================
    # Authentication (JWT)
    # ==========================
    secret_key: str = Field(default="hackathon-demo-secret-key-2024")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60 * 24)  # 24 hours for demo
    
    # ==========================
    # Database
    # ==========================
    database_url: Optional[str] = Field(default=None)
    
    # ==========================
    # Whisper/Voice Settings
    # ==========================
    whisper_model: str = Field(default="base")
    use_mock_whisper: bool = Field(default=True)  # Use mock for demo/testing
    
    # ==========================
    # Rate Limiting
    # ==========================
    rate_limit_default: str = Field(default="200 per minute")
    rate_limit_voice: str = Field(default="30 per minute")
    rate_limit_approval: str = Field(default="60 per minute")
    
    # ==========================
    # Visitor Settings
    # ==========================
    default_approval_duration: int = Field(default=90)  # minutes
    
    # ==========================
    # Logging
    # ==========================
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="console")  # console or json
    
    @property
    def base_dir(self) -> Path:
        """Get base directory path."""
        return Path(__file__).parent.parent
    
    @property
    def data_dir(self) -> Path:
        """Get data directory path."""
        path = self.base_dir / "data"
        path.mkdir(exist_ok=True)
        return path
    
    @property
    def photos_dir(self) -> Path:
        """Get photos directory path."""
        path = self.data_dir / "photos"
        path.mkdir(exist_ok=True)
        return path
    
    @property
    def audio_dir(self) -> Path:
        """Get audio directory path."""
        path = self.data_dir / "audio"
        path.mkdir(exist_ok=True)
        return path
    
    @property
    def db_url(self) -> str:
        """Get database URL with fallback to SQLite."""
        if self.database_url:
            return self.database_url
        return f"sqlite:///{self.data_dir / 'database.db'}"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.app_env == Environment.DEVELOPMENT
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.app_env == Environment.PRODUCTION
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from string."""
        if self.allowed_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid reloading .env on every access.
    """
    return Settings()


# Global settings instance
settings = get_settings()
