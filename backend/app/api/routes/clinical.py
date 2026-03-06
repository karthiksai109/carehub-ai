from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.services.ai.clinical_decision_support import clinical_decision_support
from app.core.security import get_current_user

router = APIRouter(prefix="/clinical", tags=["Clinical Decision Support"])


@router.post("/guidance")
async def get_clinical_guidance(
    condition: str,
    patient_age: Optional[int] = None,
    patient_medications: Optional[List[str]] = None,
    patient_allergies: Optional[List[str]] = None,
    current_user: dict = Depends(get_current_user),
):
    """Get AI-powered clinical guidance for a specific condition."""
    result = await clinical_decision_support.get_clinical_guidance(
        condition=condition,
        patient_age=patient_age,
        patient_medications=patient_medications,
        patient_allergies=patient_allergies,
    )
    return result


@router.post("/drug-interactions")
async def check_drug_interactions(
    medications: List[str],
    current_user: dict = Depends(get_current_user),
):
    """Check for drug-drug interactions between a list of medications."""
    result = await clinical_decision_support.check_drug_interactions(medications)
    return result


@router.get("/protocols")
async def list_protocols(
    current_user: dict = Depends(get_current_user),
):
    """List all available clinical protocols."""
    from app.services.ai.clinical_decision_support import CLINICAL_GUIDELINES
    protocols = []
    for key, guideline in CLINICAL_GUIDELINES.items():
        protocols.append({
            "key": key,
            "condition": guideline.get("condition"),
            "icd10": guideline.get("icd10"),
        })
    return {"protocols": protocols, "total": len(protocols)}
