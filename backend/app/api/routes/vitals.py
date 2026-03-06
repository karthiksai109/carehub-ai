import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.models.vitals import VitalSign
from app.models.patient import Patient
from app.schemas.vitals import VitalSignCreate, VitalSignResponse, VitalsTrendResponse
from app.services.ai.deterioration_predictor import deterioration_predictor
from app.core.security import get_current_user

router = APIRouter(prefix="/vitals", tags=["Vital Signs"])


@router.post("/", response_model=VitalSignResponse, status_code=status.HTTP_201_CREATED)
async def record_vitals(
    vitals_data: VitalSignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Record patient vital signs and run AI deterioration prediction."""
    # Verify patient exists
    patient_result = await db.execute(
        select(Patient).where(Patient.id == vitals_data.patient_id)
    )
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Get historical vitals for trend analysis
    hist_query = (
        select(VitalSign)
        .where(VitalSign.patient_id == vitals_data.patient_id)
        .order_by(VitalSign.recorded_at.desc())
        .limit(10)
    )
    hist_result = await db.execute(hist_query)
    historical = hist_result.scalars().all()

    # Run AI deterioration prediction
    current_vitals_dict = {
        "heart_rate": vitals_data.heart_rate,
        "systolic_bp": vitals_data.systolic_bp,
        "diastolic_bp": vitals_data.diastolic_bp,
        "temperature": vitals_data.temperature,
        "respiratory_rate": vitals_data.respiratory_rate,
        "oxygen_saturation": vitals_data.oxygen_saturation,
        "consciousness_level": vitals_data.consciousness_level or "alert",
    }

    historical_dicts = [
        {
            "heart_rate": v.heart_rate,
            "systolic_bp": v.systolic_bp,
            "diastolic_bp": v.diastolic_bp,
            "temperature": v.temperature,
            "respiratory_rate": v.respiratory_rate,
            "oxygen_saturation": v.oxygen_saturation,
        }
        for v in historical
    ]

    # Compute patient age
    patient_age = None
    if patient.date_of_birth:
        patient_age = (datetime.utcnow().date() - patient.date_of_birth).days // 365

    comorbidities = patient.medical_history or []

    prediction = await deterioration_predictor.predict(
        current_vitals=current_vitals_dict,
        historical_vitals=historical_dicts if historical_dicts else None,
        patient_age=patient_age,
        comorbidities=comorbidities,
    )

    # Save vital sign record
    vital = VitalSign(
        id=uuid.uuid4(),
        patient_id=vitals_data.patient_id,
        heart_rate=vitals_data.heart_rate,
        systolic_bp=vitals_data.systolic_bp,
        diastolic_bp=vitals_data.diastolic_bp,
        temperature=vitals_data.temperature,
        respiratory_rate=vitals_data.respiratory_rate,
        oxygen_saturation=vitals_data.oxygen_saturation,
        blood_glucose=vitals_data.blood_glucose,
        pain_level=vitals_data.pain_level,
        consciousness_level=vitals_data.consciousness_level,
        news_score=prediction.get("news2_score"),
        ai_deterioration_risk=prediction.get("deterioration_score"),
        ai_risk_factors=prediction.get("risk_factors", []),
        recorded_by=uuid.UUID(current_user["user_id"]),
        recorded_at=datetime.utcnow(),
        source=vitals_data.source,
    )
    db.add(vital)

    # Update patient deterioration score
    patient.deterioration_score = prediction.get("deterioration_score", 0.0)
    patient.updated_at = datetime.utcnow()

    await db.flush()
    return VitalSignResponse.model_validate(vital)


@router.get("/patient/{patient_id}", response_model=VitalsTrendResponse)
async def get_patient_vitals(
    patient_id: uuid.UUID,
    hours: int = Query(24, ge=1, le=720),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get patient vital signs history with trend analysis."""
    since = datetime.utcnow() - timedelta(hours=hours)
    query = (
        select(VitalSign)
        .where(VitalSign.patient_id == patient_id)
        .where(VitalSign.recorded_at >= since)
        .order_by(VitalSign.recorded_at.desc())
    )
    result = await db.execute(query)
    vitals = result.scalars().all()

    return VitalsTrendResponse(
        patient_id=patient_id,
        vitals=[VitalSignResponse.model_validate(v) for v in vitals],
    )


@router.get("/patient/{patient_id}/deterioration")
async def get_deterioration_analysis(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get detailed AI deterioration analysis for a patient."""
    # Get latest vitals
    query = (
        select(VitalSign)
        .where(VitalSign.patient_id == patient_id)
        .order_by(VitalSign.recorded_at.desc())
        .limit(20)
    )
    result = await db.execute(query)
    vitals = result.scalars().all()

    if not vitals:
        raise HTTPException(status_code=404, detail="No vital signs recorded for this patient")

    latest = vitals[0]
    current_vitals = {
        "heart_rate": latest.heart_rate,
        "systolic_bp": latest.systolic_bp,
        "diastolic_bp": latest.diastolic_bp,
        "temperature": latest.temperature,
        "respiratory_rate": latest.respiratory_rate,
        "oxygen_saturation": latest.oxygen_saturation,
        "consciousness_level": latest.consciousness_level or "alert",
    }

    historical = [
        {
            "heart_rate": v.heart_rate,
            "systolic_bp": v.systolic_bp,
            "diastolic_bp": v.diastolic_bp,
            "temperature": v.temperature,
            "respiratory_rate": v.respiratory_rate,
            "oxygen_saturation": v.oxygen_saturation,
        }
        for v in vitals[1:]
    ]

    # Get patient info
    patient_result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = patient_result.scalar_one_or_none()

    patient_age = None
    comorbidities = []
    if patient:
        if patient.date_of_birth:
            patient_age = (datetime.utcnow().date() - patient.date_of_birth).days // 365
        comorbidities = patient.medical_history or []

    prediction = await deterioration_predictor.predict(
        current_vitals=current_vitals,
        historical_vitals=historical if historical else None,
        patient_age=patient_age,
        comorbidities=comorbidities,
    )

    return prediction


from app.models.patient import Patient
