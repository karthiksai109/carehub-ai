import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class Medication(Base):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(255), nullable=True)
    drug_class = Column(String(100), nullable=True)
    dosage_form = Column(String(100), nullable=True)  # tablet, capsule, injection, syrup
    strength = Column(String(50), nullable=True)
    manufacturer = Column(String(255), nullable=True)
    contraindications = Column(JSON, default=list)
    side_effects = Column(JSON, default=list)
    interactions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class DrugInteraction(Base):
    __tablename__ = "drug_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    drug_a_id = Column(UUID(as_uuid=True), ForeignKey("medications.id"), nullable=False, index=True)
    drug_b_id = Column(UUID(as_uuid=True), ForeignKey("medications.id"), nullable=False, index=True)
    severity = Column(String(20), nullable=False)  # minor, moderate, major, contraindicated
    description = Column(Text, nullable=True)
    mechanism = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    evidence_level = Column(String(50), nullable=True)
    source = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
