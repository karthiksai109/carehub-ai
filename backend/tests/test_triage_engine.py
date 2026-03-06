import pytest
import asyncio
from app.services.ai.triage_engine import triage_engine


@pytest.fixture
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


class TestTriageEngine:
    """Test suite for AI Triage Engine."""

    @pytest.mark.asyncio
    async def test_critical_chest_pain(self):
        result = await triage_engine.assess(
            symptoms="severe chest pain radiating to left arm, difficulty breathing",
            patient_age=55,
            patient_gender="male",
            pain_level=9,
        )
        assert result["ai_urgency_level"] == "critical"
        assert result["ai_urgency_score"] >= 0.85
        assert result["ai_recommended_department"] == "cardiac"

    @pytest.mark.asyncio
    async def test_emergency_high_fever(self):
        result = await triage_engine.assess(
            symptoms="high fever, persistent vomiting, severe pain",
            patient_age=72,
            patient_gender="female",
            pain_level=8,
        )
        assert result["ai_urgency_level"] in ["critical", "emergency"]
        assert result["ai_urgency_score"] >= 0.65

    @pytest.mark.asyncio
    async def test_non_urgent_cold(self):
        result = await triage_engine.assess(
            symptoms="mild cough, runny nose",
            patient_age=25,
            patient_gender="male",
            pain_level=2,
        )
        assert result["ai_urgency_level"] in ["non_urgent", "semi_urgent"]
        assert result["ai_urgency_score"] < 0.45

    @pytest.mark.asyncio
    async def test_pediatric_age_boost(self):
        result = await triage_engine.assess(
            symptoms="fever, vomiting",
            patient_age=3,
            pain_level=5,
        )
        # Pediatric patients should get a risk boost
        result_adult = await triage_engine.assess(
            symptoms="fever, vomiting",
            patient_age=30,
            pain_level=5,
        )
        assert result["ai_urgency_score"] >= result_adult["ai_urgency_score"]

    @pytest.mark.asyncio
    async def test_elderly_age_boost(self):
        result_elderly = await triage_engine.assess(
            symptoms="moderate pain, confusion",
            patient_age=82,
        )
        result_young = await triage_engine.assess(
            symptoms="moderate pain, confusion",
            patient_age=35,
        )
        assert result_elderly["ai_urgency_score"] >= result_young["ai_urgency_score"]

    @pytest.mark.asyncio
    async def test_vital_signs_analysis(self):
        result = await triage_engine.assess(
            symptoms="feeling unwell",
            vital_signs={
                "heart_rate": 140,
                "oxygen_saturation": 87,
                "systolic_bp": 75,
                "temperature": 40.5,
            },
        )
        assert result["ai_urgency_level"] == "critical"
        assert result["ai_urgency_score"] >= 0.9

    @pytest.mark.asyncio
    async def test_department_routing_neuro(self):
        result = await triage_engine.assess(
            symptoms="sudden severe headache, numbness on left side, vision problems",
        )
        assert result["ai_recommended_department"] == "neurology"

    @pytest.mark.asyncio
    async def test_department_routing_ortho(self):
        result = await triage_engine.assess(
            symptoms="fell down stairs, suspected fracture in left arm, joint swelling",
        )
        assert result["ai_recommended_department"] == "orthopedics"

    @pytest.mark.asyncio
    async def test_suggested_tests_present(self):
        result = await triage_engine.assess(
            symptoms="chest pain",
        )
        assert len(result["ai_suggested_tests"]) > 0

    @pytest.mark.asyncio
    async def test_reasoning_chain_present(self):
        result = await triage_engine.assess(
            symptoms="abdominal pain",
            patient_age=40,
        )
        assert result["ai_reasoning"] is not None
        assert "Symptom Analysis" in result["ai_reasoning"]
