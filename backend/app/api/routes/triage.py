import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.models.triage import TriageRecord
from app.schemas.triage import TriageRequest, TriageResponse, TriageListResponse
from app.services.ai.triage_engine import triage_engine
from app.core.security import get_current_user

router = APIRouter(prefix="/triage", tags=["AI Triage"])


@router.post("/assess", response_model=TriageResponse, status_code=status.HTTP_201_CREATED)
async def perform_triage(
    request: TriageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Perform AI-powered triage assessment on patient symptoms."""
    ai_result = await triage_engine.assess(
        symptoms=request.symptoms,
        patient_age=request.patient_age,
        patient_gender=request.patient_gender,
        pain_level=request.pain_level,
        vital_signs=request.vital_signs,
    )

    record = TriageRecord(
        id=uuid.uuid4(),
        patient_id=request.patient_id,
        patient_name=request.patient_name,
        patient_age=request.patient_age,
        patient_gender=request.patient_gender,
        symptoms=request.symptoms,
        symptom_duration=request.symptom_duration,
        pain_level=request.pain_level,
        vital_signs_snapshot=request.vital_signs or {},
        ai_urgency_level=ai_result["ai_urgency_level"],
        ai_urgency_score=ai_result["ai_urgency_score"],
        ai_recommended_department=ai_result["ai_recommended_department"],
        ai_preliminary_assessment=ai_result["ai_preliminary_assessment"],
        ai_suggested_tests=ai_result["ai_suggested_tests"],
        ai_reasoning=ai_result["ai_reasoning"],
        triaged_by=uuid.UUID(current_user["user_id"]),
        status="assessed",
        created_at=datetime.utcnow(),
    )
    db.add(record)
    await db.flush()

    return TriageResponse.model_validate(record)


@router.get("/", response_model=TriageListResponse)
async def list_triage_records(
    urgency: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List triage records with optional filtering."""
    query = select(TriageRecord).order_by(TriageRecord.created_at.desc())

    if urgency:
        query = query.where(TriageRecord.ai_urgency_level == urgency)
    if status_filter:
        query = query.where(TriageRecord.status == status_filter)

    query = query.limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()

    # Stats
    stats_query = select(
        TriageRecord.ai_urgency_level,
        func.count(TriageRecord.id)
    ).group_by(TriageRecord.ai_urgency_level)
    stats_result = await db.execute(stats_query)
    stats = {row[0]: row[1] for row in stats_result.all()}

    count_result = await db.execute(select(func.count(TriageRecord.id)))
    total = count_result.scalar()

    return TriageListResponse(
        records=[TriageResponse.model_validate(r) for r in records],
        total=total,
        stats=stats,
    )


@router.get("/{triage_id}", response_model=TriageResponse)
async def get_triage_record(
    triage_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(TriageRecord).where(TriageRecord.id == triage_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Triage record not found")
    return TriageResponse.model_validate(record)


@router.post("/{triage_id}/override")
async def override_triage(
    triage_id: uuid.UUID,
    override_urgency: str,
    override_reason: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Allow clinician to override AI triage assessment."""
    result = await db.execute(select(TriageRecord).where(TriageRecord.id == triage_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Triage record not found")

    record.override_urgency = override_urgency
    record.override_reason = override_reason
    await db.flush()

    return {
        "message": "Triage override recorded",
        "original_urgency": record.ai_urgency_level,
        "override_urgency": override_urgency,
        "reason": override_reason,
    }
