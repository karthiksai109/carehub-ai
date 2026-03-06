import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class VitalSign(Base):
    __tablename__ = "vital_signs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    heart_rate = Column(Integer, nullable=True)  # bpm
    systolic_bp = Column(Integer, nullable=True)  # mmHg
    diastolic_bp = Column(Integer, nullable=True)  # mmHg
    temperature = Column(Float, nullable=True)  # Celsius
    respiratory_rate = Column(Integer, nullable=True)  # breaths/min
    oxygen_saturation = Column(Float, nullable=True)  # SpO2 %
    blood_glucose = Column(Float, nullable=True)  # mg/dL
    pain_level = Column(Integer, nullable=True)  # 0-10
    consciousness_level = Column(String(20), nullable=True)  # AVPU scale
    news_score = Column(Integer, nullable=True)  # National Early Warning Score
    ai_deterioration_risk = Column(Float, nullable=True)  # 0.0 - 1.0
    ai_risk_factors = Column(JSON, default=list)
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String(50), default="manual")  # manual, iot_device, imported
