"""
Base model class with common fields and methods
"""
from datetime import datetime
from typing import Any
import uuid
from sqlalchemy import Column, DateTime, String
from sqlalchemy.ext.declarative import declared_attr

from ..database import Base
from ..config import settings


# Helper function for UUID/String column type
def get_uuid_column():
    """Get appropriate ID column type based on database"""
    if 'sqlite' in str(settings.DATABASE_URL):
        return String(36)
    else:
        from sqlalchemy.dialects.postgresql import UUID
        return UUID(as_uuid=True)


class BaseModel(Base):
    """
    Base model class with common fields
    """
    __abstract__ = True
    
    # Use String for SQLite, UUID for PostgreSQL
    @declared_attr
    def id(cls):
        if 'sqlite' in str(settings.DATABASE_URL):
            return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        else:
            from sqlalchemy.dialects.postgresql import UUID
            return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Generate table name from class name
        """
        return cls.__name__.lower()
    
    def to_dict(self) -> dict[str, Any]:
        """
        Convert model instance to dictionary
        """
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def update(self, **kwargs) -> None:
        """
        Update model instance with provided keyword arguments
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)