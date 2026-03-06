import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    appointment_type = Column(String(50), nullable=False)  # consultation, follow_up, emergency, procedure, lab_test
    status = Column(String(20), default="scheduled")  # scheduled, confirmed, in_progress, completed, cancelled, no_show
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    scheduled_at = Column(DateTime, nullable=False, index=True)
    duration_minutes = Column(String(10), default="30")
    department = Column(String(100), nullable=True)
    room = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    ai_suggested = Column(String(10), default="false")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
