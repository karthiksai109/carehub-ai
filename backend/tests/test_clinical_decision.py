import pytest
import asyncio
from app.services.ai.clinical_decision_support import clinical_decision_support


class TestClinicalDecisionSupport:
    """Test suite for Clinical Decision Support AI."""

    @pytest.mark.asyncio
    async def test_get_chest_pain_guidance(self):
        result = await clinical_decision_support.get_clinical_guidance(
            condition="chest pain"
        )
        assert result["found"] is True
        assert "Chest Pain" in result["condition"]
        assert result["icd10"] == "R07.9"

    @pytest.mark.asyncio
    async def test_get_sepsis_guidance(self):
        result = await clinical_decision_support.get_clinical_guidance(
            condition="sepsis"
        )
        assert result["found"] is True
        assert "hour1_bundle" in result["guideline"]

    @pytest.mark.asyncio
    async def test_unknown_condition(self):
        result = await clinical_decision_support.get_clinical_guidance(
            condition="xyznonexistent"
        )
        assert result["found"] is False
        assert "general_recommendations" in result

    @pytest.mark.asyncio
    async def test_drug_interaction_warfarin_aspirin(self):
        result = await clinical_decision_support.check_drug_interactions(
            medications=["Warfarin", "Aspirin"]
        )
        assert result["total_interactions"] >= 1
        assert result["has_critical_interactions"] is True
        assert result["interactions"][0]["severity"] == "major"

    @pytest.mark.asyncio
    async def test_drug_interaction_no_conflicts(self):
        result = await clinical_decision_support.check_drug_interactions(
            medications=["Acetaminophen", "Vitamin D"]
        )
        assert result["total_interactions"] == 0
        assert result["has_critical_interactions"] is False

    @pytest.mark.asyncio
    async def test_drug_interaction_multiple(self):
        result = await clinical_decision_support.check_drug_interactions(
            medications=["Warfarin", "Aspirin", "Omeprazole", "Clopidogrel"]
        )
        assert result["total_interactions"] >= 2

    @pytest.mark.asyncio
    async def test_age_adjustments_elderly(self):
        result = await clinical_decision_support.get_clinical_guidance(
            condition="hypertension",
            patient_age=75,
        )
        assert len(result["age_considerations"]) > 0
        assert any("Geriatric" in c for c in result["age_considerations"])

    @pytest.mark.asyncio
    async def test_age_adjustments_pediatric(self):
        result = await clinical_decision_support.get_clinical_guidance(
            condition="pneumonia",
            patient_age=8,
        )
        assert len(result["age_considerations"]) > 0
        assert any("Pediatric" in c for c in result["age_considerations"])
