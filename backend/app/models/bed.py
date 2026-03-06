import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class Ward(Base):
    __tablename__ = "wards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    ward_type = Column(String(50), nullable=False)  # general, icu, emergency, pediatric, maternity, surgical
    floor = Column(Integer, nullable=False)
    total_beds = Column(Integer, default=0)
    available_beds = Column(Integer, default=0)
    department = Column(String(100), nullable=True)
    nurse_station_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Bed(Base):
    __tablename__ = "beds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bed_number = Column(String(20), nullable=False)
    ward_id = Column(UUID(as_uuid=True), ForeignKey("wards.id"), nullable=False, index=True)
    status = Column(String(20), default="available")  # available, occupied, maintenance, reserved
    bed_type = Column(String(50), default="standard")  # standard, icu, isolation, pediatric, bariatric
    is_monitored = Column(Boolean, default=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True)
    assigned_nurse_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    last_sanitized = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
