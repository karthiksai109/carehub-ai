import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.models.bed import Bed, Ward
from app.schemas.bed import WardCreate, WardResponse, BedCreate, BedResponse, BedOccupancyDashboard
from app.services.ai.bed_optimizer import bed_optimizer
from app.core.security import get_current_user

router = APIRouter(prefix="/beds", tags=["Bed Management"])


@router.get("/dashboard", response_model=BedOccupancyDashboard)
async def get_bed_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get real-time bed occupancy dashboard with AI predictions."""
    beds_result = await db.execute(select(Bed))
    all_beds = beds_result.scalars().all()

    total = len(all_beds)
    occupied = sum(1 for b in all_beds if b.status == "occupied")
    available = sum(1 for b in all_beds if b.status == "available")
    maintenance = sum(1 for b in all_beds if b.status == "maintenance")
    reserved = sum(1 for b in all_beds if b.status == "reserved")

    # Ward breakdown
    wards_result = await db.execute(select(Ward))
    wards = wards_result.scalars().all()
    ward_data = []
    for ward in wards:
        ward_beds = [b for b in all_beds if b.ward_id == ward.id]
        ward_data.append({
            "id": str(ward.id),
            "name": ward.name,
            "type": ward.ward_type,
            "floor": ward.floor,
            "total": len(ward_beds),
            "occupied": sum(1 for b in ward_beds if b.status == "occupied"),
            "available": sum(1 for b in ward_beds if b.status == "available"),
            "occupancy_rate": round(
                sum(1 for b in ward_beds if b.status == "occupied") / len(ward_beds) * 100, 1
            ) if ward_beds else 0,
        })

    # AI capacity prediction
    capacity_prediction = await bed_optimizer.predict_capacity(
        current_occupancy={"total": total, "occupied": occupied},
    )

    return BedOccupancyDashboard(
        total_beds=total,
        occupied=occupied,
        available=available,
        maintenance=maintenance,
        reserved=reserved,
        occupancy_rate=round(occupied / total * 100, 1) if total > 0 else 0,
        wards=ward_data,
        predicted_discharges_24h=capacity_prediction.get("predicted_discharges_24h", 0),
        predicted_admissions_24h=capacity_prediction.get("predicted_admissions_24h", 0),
    )


@router.post("/wards", response_model=WardResponse, status_code=status.HTTP_201_CREATED)
async def create_ward(
    ward_data: WardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    ward = Ward(
        id=uuid.uuid4(),
        name=ward_data.name,
        ward_type=ward_data.ward_type,
        floor=ward_data.floor,
        department=ward_data.department,
        created_at=datetime.utcnow(),
    )
    db.add(ward)
    await db.flush()
    return WardResponse.model_validate(ward)


@router.get("/wards", response_model=list[WardResponse])
async def list_wards(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Ward))
    wards = result.scalars().all()
    return [WardResponse.model_validate(w) for w in wards]


@router.post("/", response_model=BedResponse, status_code=status.HTTP_201_CREATED)
async def create_bed(
    bed_data: BedCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    bed = Bed(
        id=uuid.uuid4(),
        bed_number=bed_data.bed_number,
        ward_id=bed_data.ward_id,
        bed_type=bed_data.bed_type,
        status="available",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(bed)

    # Update ward bed counts
    ward_result = await db.execute(select(Ward).where(Ward.id == bed_data.ward_id))
    ward = ward_result.scalar_one_or_none()
    if ward:
        ward.total_beds += 1
        ward.available_beds += 1

    await db.flush()
    return BedResponse.model_validate(bed)


@router.put("/{bed_id}/assign")
async def assign_patient_to_bed(
    bed_id: uuid.UUID,
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    bed_result = await db.execute(select(Bed).where(Bed.id == bed_id))
    bed = bed_result.scalar_one_or_none()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if bed.status != "available":
        raise HTTPException(status_code=400, detail="Bed is not available")

    bed.patient_id = patient_id
    bed.status = "occupied"
    bed.updated_at = datetime.utcnow()

    await db.flush()
    return {"message": "Patient assigned to bed", "bed": BedResponse.model_validate(bed)}


@router.put("/{bed_id}/discharge")
async def discharge_from_bed(
    bed_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    bed_result = await db.execute(select(Bed).where(Bed.id == bed_id))
    bed = bed_result.scalar_one_or_none()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")

    bed.patient_id = None
    bed.status = "available"
    bed.last_sanitized = datetime.utcnow()
    bed.updated_at = datetime.utcnow()

    await db.flush()
    return {"message": "Patient discharged, bed now available"}
