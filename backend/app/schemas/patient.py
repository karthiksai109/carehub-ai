from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID


class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_id: Optional[str] = None
    allergies: List[str] = []
    medical_history: List[str] = []
    current_medications: List[str] = []


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    admission_status: Optional[str] = None
    assigned_doctor_id: Optional[UUID] = None
    assigned_bed_id: Optional[UUID] = None
    allergies: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None


class PatientResponse(BaseModel):
    id: UUID
    medical_record_number: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    admission_status: str
    risk_score: float
    deterioration_score: float
    allergies: List[str] = []
    current_medications: List[str] = []
    assigned_doctor_id: Optional[UUID] = None
    assigned_bed_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    total: int
    page: int
    per_page: int
