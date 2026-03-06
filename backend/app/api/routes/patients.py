import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.db.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientListResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])


def _generate_mrn() -> str:
    return f"MRN-{datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:8].upper()}"


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    patient = Patient(
        id=uuid.uuid4(),
        medical_record_number=_generate_mrn(),
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        blood_type=patient_data.blood_type,
        phone=patient_data.phone,
        email=patient_data.email,
        address=patient_data.address,
        emergency_contact_name=patient_data.emergency_contact_name,
        emergency_contact_phone=patient_data.emergency_contact_phone,
        insurance_provider=patient_data.insurance_provider,
        insurance_id=patient_data.insurance_id,
        allergies=patient_data.allergies,
        medical_history=patient_data.medical_history,
        current_medications=patient_data.current_medications,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(patient)
    await db.flush()
    return PatientResponse.model_validate(patient)


@router.get("/", response_model=PatientListResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(Patient)

    if search:
        query = query.where(
            or_(
                Patient.first_name.ilike(f"%{search}%"),
                Patient.last_name.ilike(f"%{search}%"),
                Patient.medical_record_number.ilike(f"%{search}%"),
            )
        )

    if status_filter:
        query = query.where(Patient.admission_status == status_filter)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    patients = result.scalars().all()

    return PatientListResponse(
        patients=[PatientResponse.model_validate(p) for p in patients],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse.model_validate(patient)


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: uuid.UUID,
    update_data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(patient, key, value)
    patient.updated_at = datetime.utcnow()

    await db.flush()
    return PatientResponse.model_validate(patient)


@router.get("/{patient_id}/summary")
async def get_patient_summary(
    patient_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    age = (datetime.utcnow().date() - patient.date_of_birth).days // 365

    return {
        "patient": PatientResponse.model_validate(patient),
        "age": age,
        "risk_summary": {
            "overall_risk": "high" if patient.risk_score > 0.7 else "medium" if patient.risk_score > 0.4 else "low",
            "deterioration_risk": patient.deterioration_score,
            "risk_score": patient.risk_score,
        },
        "allergies_count": len(patient.allergies) if patient.allergies else 0,
        "medications_count": len(patient.current_medications) if patient.current_medications else 0,
    }
