"""
Configuration for the application
Handles database path, secrets, environment variables
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/database.db")
SQLALCHEMY_ECHO = False

# API Keys and Secrets
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Google Calendar Configuration
GOOGLE_CALENDAR_CREDENTIALS = os.getenv("GOOGLE_CALENDAR_CREDENTIALS", "")

# Notification Configuration
SMS_API_KEY = os.getenv("SMS_API_KEY", "")
PUSH_NOTIFICATION_KEY = os.getenv("PUSH_NOTIFICATION_KEY", "")

# File storage configuration
PHOTOS_DIR = os.path.join(os.path.dirname(__file__), "data/photos")
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "data/audio")

# Create directories if they don't exist
os.makedirs(PHOTOS_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)
