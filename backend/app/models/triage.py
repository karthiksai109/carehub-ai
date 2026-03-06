import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Float, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class TriageRecord(Base):
    __tablename__ = "triage_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True)
    patient_name = Column(String(255), nullable=True)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String(20), nullable=True)
    symptoms = Column(Text, nullable=False)
    symptom_duration = Column(String(100), nullable=True)
    pain_level = Column(Integer, nullable=True)  # 0-10
    vital_signs_snapshot = Column(JSON, default=dict)
    ai_urgency_level = Column(String(20), nullable=False)  # critical, emergency, urgent, semi_urgent, non_urgent
    ai_urgency_score = Column(Float, nullable=False)  # 0.0 - 1.0
    ai_recommended_department = Column(String(100), nullable=True)
    ai_preliminary_assessment = Column(Text, nullable=True)
    ai_suggested_tests = Column(JSON, default=list)
    ai_reasoning = Column(Text, nullable=True)
    triaged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    override_urgency = Column(String(20), nullable=True)
    override_reason = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, assessed, admitted, discharged
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
