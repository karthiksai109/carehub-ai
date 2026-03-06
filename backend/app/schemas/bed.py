from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID


class WardCreate(BaseModel):
    name: str
    ward_type: str
    floor: int
    department: Optional[str] = None


class WardResponse(BaseModel):
    id: UUID
    name: str
    ward_type: str
    floor: int
    total_beds: int
    available_beds: int
    department: Optional[str] = None

    class Config:
        from_attributes = True


class BedCreate(BaseModel):
    bed_number: str
    ward_id: UUID
    bed_type: str = "standard"


class BedResponse(BaseModel):
    id: UUID
    bed_number: str
    ward_id: UUID
    status: str
    bed_type: str
    is_monitored: bool
    patient_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class BedOccupancyDashboard(BaseModel):
    total_beds: int
    occupied: int
    available: int
    maintenance: int
    reserved: int
    occupancy_rate: float
    wards: List[Dict]
    predicted_discharges_24h: int = 0
    predicted_admissions_24h: int = 0
