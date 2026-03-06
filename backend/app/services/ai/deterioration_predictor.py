import logging
import math
from typing import Dict, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

# National Early Warning Score (NEWS2) parameters
# Based on Royal College of Physicians NEWS2 scoring system
NEWS2_PARAMS = {
    "respiratory_rate": [
        (0, 8, 3), (9, 11, 1), (12, 20, 0), (21, 24, 2), (25, 999, 3)
    ],
    "oxygen_saturation": [
        (0, 91, 3), (92, 93, 2), (94, 95, 1), (96, 100, 0)
    ],
    "systolic_bp": [
        (0, 90, 3), (91, 100, 2), (101, 110, 1), (111, 219, 0), (220, 999, 3)
    ],
    "heart_rate": [
        (0, 40, 3), (41, 50, 1), (51, 90, 0), (91, 110, 1), (111, 130, 2), (131, 999, 3)
    ],
    "temperature": [
        (0, 35.0, 3), (35.1, 36.0, 1), (36.1, 38.0, 0), (38.1, 39.0, 1), (39.1, 999, 2)
    ],
}

CONSCIOUSNESS_SCORES = {
    "alert": 0,
    "voice": 1,  # responds to voice
    "pain": 2,   # responds to pain
    "unresponsive": 3,
    "confused": 1,
    "drowsy": 2,
}

NEWS2_RISK_LEVELS = {
    (0, 0): ("low", "Continue routine monitoring every 12 hours."),
    (1, 4): ("low", "Increase monitoring frequency to every 4-6 hours. Inform registered nurse."),
    (5, 6): ("medium", "Urgent response required. Increase monitoring to every hour minimum. Alert medical team immediately."),
    (7, 20): ("high", "EMERGENCY response required. Continuous monitoring. Immediate senior clinician assessment. Consider ICU transfer."),
}


class DeteriorationPredictor:
    """
    AI-powered patient deterioration prediction engine.
    Implements NEWS2 (National Early Warning Score 2) combined with
    trend analysis and pattern recognition for early warning detection.
    """

    def __init__(self):
        self.alert_thresholds = {
            "critical": 0.85,
            "high": 0.65,
            "medium": 0.45,
            "low": 0.25,
        }

    async def predict(
        self,
        current_vitals: Dict,
        historical_vitals: Optional[List[Dict]] = None,
        patient_age: Optional[int] = None,
        comorbidities: Optional[List[str]] = None,
    ) -> Dict:
        """
        Predict patient deterioration risk using NEWS2 scoring
        combined with trend analysis.
        """
        # Step 1: Calculate NEWS2 score
        news2_score, news2_breakdown = self._calculate_news2(current_vitals)
        
        # Step 2: Determine NEWS2 risk level
        risk_level, clinical_action = self._get_risk_level(news2_score)
        
        # Step 3: Analyze vital sign trends
        trend_analysis = {}
        if historical_vitals and len(historical_vitals) >= 2:
            trend_analysis = self._analyze_trends(current_vitals, historical_vitals)
        
        # Step 4: Calculate composite deterioration score
        deterioration_score = self._compute_deterioration_score(
            news2_score, trend_analysis, patient_age, comorbidities
        )
        
        # Step 5: Identify specific risk factors
        risk_factors = self._identify_risk_factors(
            current_vitals, news2_breakdown, trend_analysis,
            patient_age, comorbidities
        )
        
        # Step 6: Generate clinical recommendations
        recommendations = self._generate_recommendations(
            news2_score, risk_level, risk_factors, deterioration_score
        )
        
        # Step 7: Determine if alert should be triggered
        should_alert = deterioration_score >= self.alert_thresholds["medium"]
        alert_severity = self._score_to_severity(deterioration_score)

        return {
            "news2_score": news2_score,
            "news2_breakdown": news2_breakdown,
            "risk_level": risk_level,
            "deterioration_score": round(deterioration_score, 3),
            "risk_factors": risk_factors,
            "trend_analysis": trend_analysis,
            "clinical_action": clinical_action,
            "recommendations": recommendations,
            "should_alert": should_alert,
            "alert_severity": alert_severity,
            "predicted_at": datetime.utcnow().isoformat(),
        }

    def _calculate_news2(self, vitals: Dict) -> Tuple[int, Dict]:
        total_score = 0
        breakdown = {}

        for param, ranges in NEWS2_PARAMS.items():
            value = vitals.get(param)
            if value is not None:
                for low, high, score in ranges:
                    if low <= value <= high:
                        breakdown[param] = {"value": value, "score": score}
                        total_score += score
                        break

        # Consciousness scoring
        consciousness = vitals.get("consciousness_level", "alert").lower()
        c_score = CONSCIOUSNESS_SCORES.get(consciousness, 0)
        breakdown["consciousness"] = {"value": consciousness, "score": c_score}
        total_score += c_score

        # Supplemental oxygen
        if vitals.get("on_supplemental_oxygen", False):
            breakdown["supplemental_oxygen"] = {"value": True, "score": 2}
            total_score += 2

        return total_score, breakdown

    def _get_risk_level(self, score: int) -> Tuple[str, str]:
        for (low, high), (level, action) in NEWS2_RISK_LEVELS.items():
            if low <= score <= high:
                return level, action
        return "high", "Emergency response required."

    def _analyze_trends(self, current: Dict, historical: List[Dict]) -> Dict:
        trends = {}
        vital_params = ["heart_rate", "systolic_bp", "diastolic_bp", "temperature",
                        "respiratory_rate", "oxygen_saturation"]
        
        for param in vital_params:
            current_val = current.get(param)
            if current_val is None:
                continue
            
            hist_values = [h.get(param) for h in historical if h.get(param) is not None]
            if not hist_values:
                continue
            
            avg_historical = sum(hist_values) / len(hist_values)
            change = current_val - avg_historical
            pct_change = (change / avg_historical * 100) if avg_historical != 0 else 0
            
            # Determine trend direction and concern level
            if abs(pct_change) < 5:
                direction = "stable"
                concern = "none"
            elif pct_change > 0:
                direction = "increasing"
                concern = "high" if abs(pct_change) > 15 else "moderate" if abs(pct_change) > 10 else "low"
            else:
                direction = "decreasing"
                concern = "high" if abs(pct_change) > 15 else "moderate" if abs(pct_change) > 10 else "low"
            
            # Special cases where decrease is actually dangerous
            if param == "oxygen_saturation" and direction == "decreasing":
                concern = "high" if abs(pct_change) > 5 else concern
            if param == "systolic_bp" and direction == "decreasing" and current_val < 100:
                concern = "high"
            
            trends[param] = {
                "current": current_val,
                "average_historical": round(avg_historical, 1),
                "change": round(change, 1),
                "percent_change": round(pct_change, 1),
                "direction": direction,
                "concern": concern,
            }
        
        return trends

    def _compute_deterioration_score(
        self, news2: int, trends: Dict,
        age: Optional[int], comorbidities: Optional[List[str]]
    ) -> float:
        # Base score from NEWS2 (normalized to 0-1 range, max NEWS2 ≈ 20)
        base_score = min(1.0, news2 / 15.0)
        
        # Trend penalty: add risk for worsening trends
        trend_penalty = 0.0
        for param, trend_data in trends.items():
            if trend_data.get("concern") == "high":
                trend_penalty += 0.08
            elif trend_data.get("concern") == "moderate":
                trend_penalty += 0.04
        trend_penalty = min(0.25, trend_penalty)
        
        # Age factor
        age_factor = 0.0
        if age:
            if age > 80:
                age_factor = 0.1
            elif age > 70:
                age_factor = 0.06
            elif age < 5:
                age_factor = 0.08
        
        # Comorbidity factor
        comorbidity_factor = 0.0
        if comorbidities:
            high_risk_conditions = ["diabetes", "copd", "heart failure", "chronic kidney disease",
                                    "cancer", "immunocompromised", "liver disease"]
            matches = sum(1 for c in comorbidities if any(h in c.lower() for h in high_risk_conditions))
            comorbidity_factor = min(0.15, matches * 0.05)
        
        total = base_score + trend_penalty + age_factor + comorbidity_factor
        return min(1.0, total)

    def _identify_risk_factors(
        self, vitals: Dict, news2_breakdown: Dict, trends: Dict,
        age: Optional[int], comorbidities: Optional[List[str]]
    ) -> List[str]:
        factors = []
        
        # Individual vital sign alerts
        hr = vitals.get("heart_rate")
        if hr and (hr > 120 or hr < 45):
            factors.append(f"Critical heart rate: {hr} bpm")
        
        spo2 = vitals.get("oxygen_saturation")
        if spo2 and spo2 < 92:
            factors.append(f"Low oxygen saturation: {spo2}%")
        
        sbp = vitals.get("systolic_bp")
        if sbp and (sbp > 200 or sbp < 90):
            factors.append(f"Critical blood pressure: {sbp} mmHg")
        
        temp = vitals.get("temperature")
        if temp and (temp > 39.5 or temp < 35.0):
            factors.append(f"Abnormal temperature: {temp}°C")
        
        rr = vitals.get("respiratory_rate")
        if rr and (rr > 25 or rr < 9):
            factors.append(f"Abnormal respiratory rate: {rr}/min")
        
        # Trend-based risk factors
        for param, trend_data in trends.items():
            if trend_data.get("concern") == "high":
                direction = trend_data["direction"]
                pct = abs(trend_data["percent_change"])
                factors.append(f"Rapid {direction} in {param.replace('_', ' ')}: {pct:.1f}% change")
        
        # Age-based risk
        if age and (age > 75 or age < 5):
            factors.append(f"High-risk age group: {age} years")
        
        # Comorbidity risks
        if comorbidities:
            for condition in comorbidities[:3]:
                factors.append(f"Comorbidity: {condition}")
        
        return factors

    def _generate_recommendations(
        self, news2: int, risk_level: str,
        risk_factors: List[str], deterioration_score: float
    ) -> List[str]:
        recommendations = []
        
        if risk_level == "high" or deterioration_score >= 0.7:
            recommendations.extend([
                "IMMEDIATE: Alert senior clinician and rapid response team",
                "Initiate continuous vital signs monitoring",
                "Consider ICU/HDU transfer",
                "Prepare emergency intervention equipment",
                "Review and optimize current treatment plan",
                "Obtain arterial blood gas if not already done",
            ])
        elif risk_level == "medium" or deterioration_score >= 0.45:
            recommendations.extend([
                "URGENT: Increase vital signs monitoring to hourly",
                "Alert attending physician",
                "Review current medications and interventions",
                "Prepare for potential escalation",
                "Consider additional diagnostic tests",
            ])
        elif risk_level == "low" and deterioration_score >= 0.25:
            recommendations.extend([
                "Increase monitoring frequency to every 4 hours",
                "Document trending vital signs",
                "Inform nurse in charge of gradual changes",
            ])
        else:
            recommendations.extend([
                "Continue routine monitoring every 8-12 hours",
                "Standard care protocols apply",
            ])
        
        return recommendations

    def _score_to_severity(self, score: float) -> str:
        if score >= 0.85:
            return "life_threatening"
        elif score >= 0.65:
            return "critical"
        elif score >= 0.45:
            return "warning"
        elif score >= 0.25:
            return "info"
        return "normal"


deterioration_predictor = DeteriorationPredictor()
