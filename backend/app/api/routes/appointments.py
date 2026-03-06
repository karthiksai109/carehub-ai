import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.models.appointment import Appointment
from app.core.security import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_appointment(
    patient_id: uuid.UUID,
    doctor_id: uuid.UUID,
    appointment_type: str,
    scheduled_at: datetime,
    priority: str = "normal",
    department: Optional[str] = None,
    room: Optional[str] = None,
    reason: Optional[str] = None,
    duration_minutes: str = "30",
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    appointment = Appointment(
        id=uuid.uuid4(),
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_type=appointment_type,
        scheduled_at=scheduled_at,
        priority=priority,
        department=department,
        room=room,
        reason=reason,
        duration_minutes=duration_minutes,
        status="scheduled",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(appointment)
    await db.flush()
    return {"id": str(appointment.id), "status": "scheduled", "scheduled_at": str(scheduled_at)}


@router.get("/")
async def list_appointments(
    date: Optional[str] = None,
    doctor_id: Optional[uuid.UUID] = None,
    patient_id: Optional[uuid.UUID] = None,
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(Appointment).order_by(Appointment.scheduled_at.desc())

    if doctor_id:
        query = query.where(Appointment.doctor_id == doctor_id)
    if patient_id:
        query = query.where(Appointment.patient_id == patient_id)
    if status_filter:
        query = query.where(Appointment.status == status_filter)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    appointments = result.scalars().all()

    return {
        "appointments": [
            {
                "id": str(a.id),
                "patient_id": str(a.patient_id),
                "doctor_id": str(a.doctor_id),
                "type": a.appointment_type,
                "status": a.status,
                "priority": a.priority,
                "scheduled_at": str(a.scheduled_at),
                "department": a.department,
                "room": a.room,
                "reason": a.reason,
            }
            for a in appointments
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: uuid.UUID,
    new_status: str,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = new_status
    if notes:
        appt.notes = notes
    appt.updated_at = datetime.utcnow()
    await db.flush()

    return {"message": f"Appointment status updated to {new_status}"}
