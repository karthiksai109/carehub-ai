import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Text, Float, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medical_record_number = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)
    blood_type = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    insurance_provider = Column(String(255), nullable=True)
    insurance_id = Column(String(100), nullable=True)
    allergies = Column(JSON, default=list)
    medical_history = Column(JSON, default=list)
    current_medications = Column(JSON, default=list)
    admission_status = Column(String(20), default="outpatient")  # inpatient, outpatient, discharged, emergency
    assigned_doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_bed_id = Column(UUID(as_uuid=True), ForeignKey("beds.id"), nullable=True)
    risk_score = Column(Float, default=0.0)
    deterioration_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
