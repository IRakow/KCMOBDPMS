"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from .config import settings


# Create database engine
engine = create_engine(
    str(settings.DATABASE_URL),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


# Dependency to get DB session
def get_db() -> Generator[Session, None, None]:
    """
    Create a new database session for each request and close it when done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables
    """
    # Import all models here to ensure they are registered with SQLAlchemy
    from app.models import (
        company,
        user,
        property,
        unit,
        tenant,
        lease,
    )
    
    Base.metadata.create_all(bind=engine)