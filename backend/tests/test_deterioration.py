import pytest
import asyncio
from app.services.ai.deterioration_predictor import deterioration_predictor


class TestDeteriorationPredictor:
    """Test suite for AI Deterioration Prediction Engine (NEWS2)."""

    @pytest.mark.asyncio
    async def test_normal_vitals_low_risk(self):
        result = await deterioration_predictor.predict(
            current_vitals={
                "heart_rate": 72,
                "systolic_bp": 120,
                "diastolic_bp": 78,
                "temperature": 37.0,
                "respiratory_rate": 16,
                "oxygen_saturation": 98,
                "consciousness_level": "alert",
            }
        )
        assert result["news2_score"] <= 4
        assert result["risk_level"] == "low"
        assert result["deterioration_score"] < 0.45

    @pytest.mark.asyncio
    async def test_critical_vitals_high_risk(self):
        result = await deterioration_predictor.predict(
            current_vitals={
                "heart_rate": 140,
                "systolic_bp": 82,
                "temperature": 40.2,
                "respiratory_rate": 30,
                "oxygen_saturation": 88,
                "consciousness_level": "pain",
            }
        )
        assert result["news2_score"] >= 7
        assert result["risk_level"] == "high"
        assert result["deterioration_score"] >= 0.65
        assert result["should_alert"] is True

    @pytest.mark.asyncio
    async def test_medium_risk_threshold(self):
        result = await deterioration_predictor.predict(
            current_vitals={
                "heart_rate": 112,
                "systolic_bp": 102,
                "temperature": 38.5,
                "respiratory_rate": 22,
                "oxygen_saturation": 94,
                "consciousness_level": "alert",
            }
        )
        assert result["news2_score"] >= 5
        assert result["risk_level"] in ["medium", "high"]

    @pytest.mark.asyncio
    async def test_trend_analysis_with_historical(self):
        current = {
            "heart_rate": 110,
            "systolic_bp": 95,
            "oxygen_saturation": 92,
            "temperature": 38.8,
            "respiratory_rate": 24,
            "consciousness_level": "alert",
        }
        historical = [
            {"heart_rate": 80, "systolic_bp": 125, "oxygen_saturation": 97, "temperature": 37.2, "respiratory_rate": 16},
            {"heart_rate": 85, "systolic_bp": 120, "oxygen_saturation": 96, "temperature": 37.5, "respiratory_rate": 17},
            {"heart_rate": 92, "systolic_bp": 115, "oxygen_saturation": 95, "temperature": 37.8, "respiratory_rate": 19},
        ]
        result = await deterioration_predictor.predict(
            current_vitals=current,
            historical_vitals=historical,
        )
        assert "trend_analysis" in result
        assert len(result["trend_analysis"]) > 0
        # Heart rate is increasing significantly
        hr_trend = result["trend_analysis"].get("heart_rate", {})
        if hr_trend:
            assert hr_trend["direction"] == "increasing"

    @pytest.mark.asyncio
    async def test_age_factor_elderly(self):
        base_vitals = {
            "heart_rate": 95,
            "systolic_bp": 105,
            "temperature": 38.2,
            "respiratory_rate": 21,
            "oxygen_saturation": 94,
            "consciousness_level": "alert",
        }
        result_old = await deterioration_predictor.predict(current_vitals=base_vitals, patient_age=85)
        result_young = await deterioration_predictor.predict(current_vitals=base_vitals, patient_age=35)
        assert result_old["deterioration_score"] > result_young["deterioration_score"]

    @pytest.mark.asyncio
    async def test_comorbidity_factor(self):
        base_vitals = {
            "heart_rate": 88,
            "systolic_bp": 115,
            "temperature": 37.5,
            "respiratory_rate": 18,
            "oxygen_saturation": 95,
            "consciousness_level": "alert",
        }
        result_comorb = await deterioration_predictor.predict(
            current_vitals=base_vitals,
            comorbidities=["diabetes", "heart failure", "chronic kidney disease"],
        )
        result_healthy = await deterioration_predictor.predict(
            current_vitals=base_vitals,
            comorbidities=[],
        )
        assert result_comorb["deterioration_score"] > result_healthy["deterioration_score"]

    @pytest.mark.asyncio
    async def test_recommendations_present(self):
        result = await deterioration_predictor.predict(
            current_vitals={
                "heart_rate": 135,
                "systolic_bp": 85,
                "oxygen_saturation": 89,
                "temperature": 39.8,
                "respiratory_rate": 28,
                "consciousness_level": "voice",
            }
        )
        assert len(result["recommendations"]) > 0
        assert result["alert_severity"] in ["critical", "life_threatening", "warning"]

    @pytest.mark.asyncio
    async def test_news2_breakdown(self):
        result = await deterioration_predictor.predict(
            current_vitals={
                "heart_rate": 72,
                "systolic_bp": 120,
                "temperature": 37.0,
                "respiratory_rate": 16,
                "oxygen_saturation": 98,
                "consciousness_level": "alert",
            }
        )
        assert "news2_breakdown" in result
        assert "heart_rate" in result["news2_breakdown"]
        assert "consciousness" in result["news2_breakdown"]
