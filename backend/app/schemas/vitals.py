from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class VitalSignCreate(BaseModel):
    patient_id: UUID
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    temperature: Optional[float] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    blood_glucose: Optional[float] = None
    pain_level: Optional[int] = None
    consciousness_level: Optional[str] = None
    source: str = "manual"


class VitalSignResponse(BaseModel):
    id: UUID
    patient_id: UUID
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    temperature: Optional[float] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    blood_glucose: Optional[float] = None
    pain_level: Optional[int] = None
    consciousness_level: Optional[str] = None
    news_score: Optional[int] = None
    ai_deterioration_risk: Optional[float] = None
    ai_risk_factors: List[str] = []
    recorded_at: datetime
    source: str

    class Config:
        from_attributes = True


class VitalsTrendResponse(BaseModel):
    patient_id: UUID
    vitals: List[VitalSignResponse]
    trend_analysis: Optional[dict] = None
