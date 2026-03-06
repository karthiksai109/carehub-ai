from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID


class TriageRequest(BaseModel):
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    symptoms: str
    symptom_duration: Optional[str] = None
    pain_level: Optional[int] = None
    vital_signs: Optional[Dict] = None
    patient_id: Optional[UUID] = None


class TriageResponse(BaseModel):
    id: UUID
    patient_name: Optional[str] = None
    symptoms: str
    ai_urgency_level: str
    ai_urgency_score: float
    ai_recommended_department: Optional[str] = None
    ai_preliminary_assessment: Optional[str] = None
    ai_suggested_tests: List[str] = []
    ai_reasoning: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TriageListResponse(BaseModel):
    records: List[TriageResponse]
    total: int
    stats: Dict = {}
