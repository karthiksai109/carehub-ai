import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class ClinicalAlert(Base):
    __tablename__ = "clinical_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # deterioration, drug_interaction, critical_vital, fall_risk, sepsis_risk
    severity = Column(String(20), nullable=False)  # info, warning, critical, life_threatening
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    details = Column(JSON, default=dict)
    triggered_by = Column(String(100), nullable=True)  # ai_model, vital_monitor, drug_checker, manual
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
