import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.models.patient import Patient
from app.models.vitals import VitalSign
from app.models.triage import TriageRecord
from app.models.bed import Bed, Ward
from app.models.appointment import Appointment
from app.models.alert import ClinicalAlert
from app.core.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])


@router.get("/dashboard")
async def get_analytics_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get comprehensive hospital analytics dashboard data."""
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)

    # Patient counts
    total_patients = (await db.execute(select(func.count(Patient.id)))).scalar() or 0
    inpatients = (await db.execute(
        select(func.count(Patient.id)).where(Patient.admission_status == "inpatient")
    )).scalar() or 0
    emergency_patients = (await db.execute(
        select(func.count(Patient.id)).where(Patient.admission_status == "emergency")
    )).scalar() or 0

    # High risk patients
    high_risk = (await db.execute(
        select(func.count(Patient.id)).where(Patient.deterioration_score > 0.65)
    )).scalar() or 0

    # Bed stats
    total_beds = (await db.execute(select(func.count(Bed.id)))).scalar() or 0
    occupied_beds = (await db.execute(
        select(func.count(Bed.id)).where(Bed.status == "occupied")
    )).scalar() or 0

    # Triage stats (last 24h)
    triage_24h = (await db.execute(
        select(func.count(TriageRecord.id)).where(TriageRecord.created_at >= day_ago)
    )).scalar() or 0
    critical_triage_24h = (await db.execute(
        select(func.count(TriageRecord.id))
        .where(TriageRecord.created_at >= day_ago)
        .where(TriageRecord.ai_urgency_level == "critical")
    )).scalar() or 0

    # Appointment stats
    today_appointments = (await db.execute(
        select(func.count(Appointment.id))
        .where(Appointment.scheduled_at >= now.replace(hour=0, minute=0, second=0))
        .where(Appointment.scheduled_at < now.replace(hour=23, minute=59, second=59))
    )).scalar() or 0

    # Active alerts
    active_alerts = (await db.execute(
        select(func.count(ClinicalAlert.id)).where(ClinicalAlert.is_resolved == False)
    )).scalar() or 0
    critical_alerts = (await db.execute(
        select(func.count(ClinicalAlert.id))
        .where(ClinicalAlert.is_resolved == False)
        .where(ClinicalAlert.severity.in_(["critical", "life_threatening"]))
    )).scalar() or 0

    # Triage distribution (last 7 days)
    triage_dist_result = await db.execute(
        select(TriageRecord.ai_urgency_level, func.count(TriageRecord.id))
        .where(TriageRecord.created_at >= week_ago)
        .group_by(TriageRecord.ai_urgency_level)
    )
    triage_distribution = {row[0]: row[1] for row in triage_dist_result.all()}

    return {
        "overview": {
            "total_patients": total_patients,
            "inpatients": inpatients,
            "emergency_patients": emergency_patients,
            "high_risk_patients": high_risk,
        },
        "bed_management": {
            "total_beds": total_beds,
            "occupied_beds": occupied_beds,
            "available_beds": total_beds - occupied_beds,
            "occupancy_rate": round(occupied_beds / total_beds * 100, 1) if total_beds > 0 else 0,
        },
        "triage": {
            "assessments_24h": triage_24h,
            "critical_24h": critical_triage_24h,
            "distribution_7d": triage_distribution,
        },
        "appointments": {
            "today": today_appointments,
        },
        "alerts": {
            "active": active_alerts,
            "critical": critical_alerts,
        },
        "timestamp": now.isoformat(),
    }


@router.get("/patient-risk-distribution")
async def get_risk_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get distribution of patient risk scores."""
    result = await db.execute(select(Patient.deterioration_score))
    scores = [row[0] for row in result.all() if row[0] is not None]

    if not scores:
        return {"distribution": {}, "total": 0}

    distribution = {
        "critical": sum(1 for s in scores if s >= 0.85),
        "high": sum(1 for s in scores if 0.65 <= s < 0.85),
        "medium": sum(1 for s in scores if 0.45 <= s < 0.65),
        "low": sum(1 for s in scores if 0.25 <= s < 0.45),
        "minimal": sum(1 for s in scores if s < 0.25),
    }

    return {
        "distribution": distribution,
        "total": len(scores),
        "average_score": round(sum(scores) / len(scores), 3) if scores else 0,
    }
