"""
SQLite connection & session management
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL, DATA_DIR

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
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
    print("✅ Database tables created!")


def seed_demo_data():
    """Seed demo data for testing"""
    from models import Resident, Guard
    
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(Resident).count() > 0:
            print("📦 Demo data already exists, skipping...")
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
        print("✅ Demo data seeded!")
        print("   Residents: 501 (Ahmed), 302 (Sarah), 103 (Mohammed)")
        print("   Guard: Security Guard")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    seed_demo_data()
