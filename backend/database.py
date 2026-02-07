"""
SQLite connection & session management
Production-grade with proper connection pooling
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from core import settings, logger

# Ensure data directory exists
settings.data_dir.mkdir(exist_ok=True)

# Create engine with proper pooling settings
engine = create_engine(
    settings.db_url,
    connect_args={"check_same_thread": False},  # SQLite specific
    pool_pre_ping=True,  # Check connection health before using
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    # Import models to register them
    import models
    Base.metadata.create_all(bind=engine)
    logger.info("database_tables_created")


def seed_demo_data():
    """Seed demo data for testing"""
    from models import Resident, Guard
    
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(Resident).count() > 0:
            logger.info("demo_data_exists", message="Skipping seed")
            return
        
        # Create demo residents
        residents = [
            Resident(apt_number="501", name="Ahmed Al-Rashid", phone="+971501234567", preferred_language="ar"),
            Resident(apt_number="302", name="Sarah Johnson", phone="+971502345678", preferred_language="en"),
            Resident(apt_number="103", name="Mohammed Hassan", phone="+971503456789", preferred_language="ar"),
        ]
        db.add_all(residents)
        
        # Create demo guard
        guard = Guard(name="Security Guard", phone="+971504567890")
        db.add(guard)
        
        db.commit()
        logger.info(
            "demo_data_seeded",
            residents=["501 (Ahmed)", "302 (Sarah)", "103 (Mohammed)"],
            guard="Security Guard"
        )
    except Exception as e:
        db.rollback()
        logger.error("demo_data_seed_failed", error=str(e))
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    seed_demo_data()
