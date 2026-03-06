import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class BedOptimizer:
    """
    AI-powered bed management and hospital capacity optimizer.
    Predicts discharges, optimizes bed assignments, and provides
    real-time capacity analytics for hospital operations.
    """

    # Average length of stay by ward type (in hours)
    AVG_LOS = {
        "emergency": 6,
        "general": 72,
        "icu": 96,
        "surgical": 48,
        "pediatric": 48,
        "maternity": 36,
    }

    # Bed priority weights for assignment optimization
    PRIORITY_WEIGHTS = {
        "critical": 1.0,
        "emergency": 0.85,
        "urgent": 0.65,
        "semi_urgent": 0.4,
        "non_urgent": 0.2,
    }

    async def optimize_assignment(
        self,
        patient_data: Dict,
        available_beds: List[Dict],
        ward_occupancy: Dict,
    ) -> Dict:
        """
        Determine optimal bed assignment for a patient based on
        condition severity, bed type requirements, and ward capacity.
        """
        urgency = patient_data.get("urgency_level", "non_urgent")
        required_type = self._determine_bed_type(patient_data)
        department = patient_data.get("department", "general_medicine")
        
        # Filter beds matching requirements
        candidates = [
            bed for bed in available_beds
            if bed["status"] == "available"
            and (bed["bed_type"] == required_type or required_type == "standard")
        ]
        
        if not candidates:
            # Fallback: find any available bed
            candidates = [b for b in available_beds if b["status"] == "available"]
        
        if not candidates:
            return {
                "assigned": False,
                "reason": "No beds available. Consider discharge optimization or overflow protocols.",
                "recommendations": [
                    "Review patients approaching discharge criteria",
                    "Consider step-down unit transfers for stable ICU patients",
                    "Activate surge capacity protocol if occupancy >95%",
                ],
            }
        
        # Score each candidate bed
        scored_beds = []
        for bed in candidates:
            score = self._score_bed(bed, patient_data, ward_occupancy)
            scored_beds.append({"bed": bed, "score": score})
        
        scored_beds.sort(key=lambda x: x["score"], reverse=True)
        best = scored_beds[0]
        
        return {
            "assigned": True,
            "recommended_bed": best["bed"],
            "match_score": round(best["score"], 2),
            "alternatives": [s["bed"] for s in scored_beds[1:4]],
            "bed_type": required_type,
        }

    async def predict_capacity(
        self,
        current_occupancy: Dict,
        admission_rate: float = 2.5,
        discharge_rate: float = 2.0,
        hours_ahead: int = 24,
    ) -> Dict:
        """Predict hospital capacity for the next N hours."""
        predictions = []
        current_occupied = current_occupancy.get("occupied", 0)
        total_beds = current_occupancy.get("total", 100)
        
        for hour in range(0, hours_ahead + 1, 4):
            predicted_admissions = admission_rate * (hour / 24)
            predicted_discharges = discharge_rate * (hour / 24)
            predicted_occupied = current_occupied + predicted_admissions - predicted_discharges
            predicted_occupied = max(0, min(total_beds, predicted_occupied))
            
            predictions.append({
                "hours_ahead": hour,
                "predicted_occupied": round(predicted_occupied),
                "predicted_available": round(total_beds - predicted_occupied),
                "occupancy_rate": round(predicted_occupied / total_beds * 100, 1) if total_beds > 0 else 0,
                "risk_level": "critical" if predicted_occupied / total_beds > 0.95 else
                              "high" if predicted_occupied / total_beds > 0.85 else
                              "moderate" if predicted_occupied / total_beds > 0.75 else "normal",
            })
        
        return {
            "current_occupancy": current_occupancy,
            "predictions": predictions,
            "predicted_discharges_24h": round(discharge_rate),
            "predicted_admissions_24h": round(admission_rate),
            "capacity_alert": predictions[-1]["risk_level"] in ("critical", "high"),
            "recommendations": self._capacity_recommendations(predictions[-1]),
        }

    def _determine_bed_type(self, patient_data: Dict) -> str:
        urgency = patient_data.get("urgency_level", "non_urgent")
        condition = patient_data.get("condition", "").lower()
        
        if urgency == "critical" or "icu" in condition or "ventilator" in condition:
            return "icu"
        if "isolation" in condition or "infectious" in condition or "covid" in condition:
            return "isolation"
        if patient_data.get("age", 18) < 16:
            return "pediatric"
        if patient_data.get("weight", 100) > 180:
            return "bariatric"
        return "standard"

    def _score_bed(self, bed: Dict, patient: Dict, occupancy: Dict) -> float:
        score = 0.5
        
        # Bed type match bonus
        required = self._determine_bed_type(patient)
        if bed.get("bed_type") == required:
            score += 0.3
        
        # Ward balance: prefer wards with lower occupancy
        ward_id = bed.get("ward_id")
        if ward_id and ward_id in occupancy:
            ward_occ = occupancy[ward_id]
            if ward_occ < 0.7:
                score += 0.15
            elif ward_occ < 0.85:
                score += 0.05
        
        # Monitored bed bonus for high-acuity patients
        urgency = patient.get("urgency_level", "non_urgent")
        if bed.get("is_monitored") and urgency in ("critical", "emergency"):
            score += 0.2
        
        return min(1.0, score)

    def _capacity_recommendations(self, prediction: Dict) -> List[str]:
        risk = prediction.get("risk_level", "normal")
        recs = []
        
        if risk == "critical":
            recs = [
                "CRITICAL: Activate hospital surge capacity protocol",
                "Expedite discharge planning for medically ready patients",
                "Coordinate with nearby hospitals for patient transfers",
                "Convert step-down beds to acute care if possible",
                "Divert non-emergency ambulances to alternative facilities",
            ]
        elif risk == "high":
            recs = [
                "Review all patients for discharge readiness",
                "Accelerate post-surgical recovery pathways",
                "Prepare overflow areas for potential activation",
                "Notify bed management team of projected shortfall",
            ]
        elif risk == "moderate":
            recs = [
                "Monitor occupancy trends closely",
                "Ensure timely discharge processing",
                "Pre-plan bed assignments for expected admissions",
            ]
        else:
            recs = ["Normal operations — no capacity concerns anticipated."]
        
        return recs


bed_optimizer = BedOptimizer()
