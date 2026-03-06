import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Evidence-based clinical guidelines database
CLINICAL_GUIDELINES = {
    "hypertension": {
        "condition": "Hypertension",
        "icd10": "I10",
        "stages": {
            "stage1": {"systolic": (130, 139), "diastolic": (80, 89)},
            "stage2": {"systolic": (140, 180), "diastolic": (90, 120)},
            "crisis": {"systolic": (180, 999), "diastolic": (120, 999)},
        },
        "first_line": ["Lisinopril 10mg daily", "Amlodipine 5mg daily", "Losartan 50mg daily"],
        "lifestyle": ["DASH diet", "Regular exercise 150min/week", "Sodium restriction <2300mg/day",
                       "Weight management", "Limit alcohol", "Smoking cessation"],
        "monitoring": "Recheck BP in 1-3 months. Target <130/80 mmHg.",
        "referral_criteria": "Resistant hypertension (uncontrolled on 3+ drugs), secondary hypertension suspected",
    },
    "diabetes_type2": {
        "condition": "Type 2 Diabetes Mellitus",
        "icd10": "E11",
        "diagnostic_criteria": {"fasting_glucose": 126, "hba1c": 6.5, "random_glucose": 200},
        "first_line": ["Metformin 500mg BID, titrate to 1000mg BID"],
        "second_line": ["Add GLP-1 RA (Semaglutide)", "Add SGLT2i (Empagliflozin) if CKD/HF"],
        "targets": {"hba1c": "<7.0%", "fasting_glucose": "80-130 mg/dL", "postprandial": "<180 mg/dL"},
        "monitoring": "HbA1c every 3 months, annual eye exam, foot exam, renal function",
        "lifestyle": ["Mediterranean diet", "150min moderate exercise/week", "Weight loss 5-10%"],
    },
    "chest_pain": {
        "condition": "Acute Chest Pain",
        "icd10": "R07.9",
        "immediate_workup": ["12-lead ECG within 10 minutes", "Troponin (serial at 0, 3, 6 hours)",
                              "Chest X-ray", "CBC, BMP, Coagulation panel"],
        "risk_stratification": "Use HEART score for ACS risk assessment",
        "high_risk_features": ["ST elevation", "Troponin positive", "Hemodynamic instability",
                                "New heart failure", "Sustained VT"],
        "protocol": "If STEMI: Activate cath lab. If NSTEMI: Cardiology consult within 24h.",
    },
    "sepsis": {
        "condition": "Sepsis / Septic Shock",
        "icd10": "A41.9",
        "qsofa_criteria": ["Respiratory rate ≥22/min", "Altered mentation", "Systolic BP ≤100 mmHg"],
        "hour1_bundle": [
            "Measure lactate level",
            "Obtain blood cultures before antibiotics",
            "Administer broad-spectrum antibiotics",
            "Begin rapid administration of 30mL/kg crystalloid for hypotension or lactate ≥4",
            "Apply vasopressors if hypotensive during or after fluid resuscitation (target MAP ≥65 mmHg)",
        ],
        "monitoring": "Reassess volume status and tissue perfusion. Re-measure lactate if initial >2 mmol/L.",
    },
    "pneumonia": {
        "condition": "Community-Acquired Pneumonia",
        "icd10": "J18.9",
        "workup": ["Chest X-ray", "CBC", "BMP", "Blood cultures x2", "Sputum culture",
                    "Procalcitonin", "Pulse oximetry"],
        "outpatient": ["Amoxicillin 1g TID for 5 days", "OR Doxycycline 100mg BID for 5 days"],
        "inpatient_nonsevere": ["Ceftriaxone 1g IV daily + Azithromycin 500mg IV daily"],
        "inpatient_severe": ["Ceftriaxone 1g IV daily + Azithromycin 500mg IV daily + consider ICU"],
        "severity_scoring": "Use CURB-65 or PSI for disposition decision",
    },
    "asthma_exacerbation": {
        "condition": "Acute Asthma Exacerbation",
        "icd10": "J45.901",
        "mild_moderate": ["Albuterol nebulizer 2.5mg q20min x3", "Ipratropium nebulizer 0.5mg x3",
                           "Prednisone 40-60mg PO or Methylprednisolone 125mg IV"],
        "severe": ["Continuous albuterol nebulization", "Magnesium sulfate 2g IV over 20 min",
                    "Consider non-invasive ventilation", "ICU consult if no improvement"],
        "discharge_criteria": ["PEF >70% predicted", "SpO2 >94% on room air", "Able to use inhaler correctly"],
    },
}

DRUG_INTERACTION_DB = {
    ("warfarin", "aspirin"): {
        "severity": "major",
        "effect": "Increased risk of bleeding",
        "mechanism": "Additive anticoagulant/antiplatelet effects",
        "recommendation": "Avoid combination unless specifically indicated. Monitor INR closely if co-administered.",
    },
    ("metformin", "contrast_dye"): {
        "severity": "major",
        "effect": "Risk of lactic acidosis",
        "mechanism": "Contrast-induced nephropathy impairs metformin clearance",
        "recommendation": "Hold metformin 48 hours before and after contrast administration. Check renal function.",
    },
    ("lisinopril", "potassium"): {
        "severity": "major",
        "effect": "Hyperkalemia risk",
        "mechanism": "ACE inhibitors increase potassium retention; additive with supplements",
        "recommendation": "Monitor serum potassium closely. Avoid potassium supplements unless hypokalemic.",
    },
    ("ssri", "tramadol"): {
        "severity": "major",
        "effect": "Serotonin syndrome risk",
        "mechanism": "Both increase serotonergic activity",
        "recommendation": "Avoid combination. If necessary, use lowest doses and monitor for serotonin syndrome symptoms.",
    },
    ("ciprofloxacin", "theophylline"): {
        "severity": "major",
        "effect": "Theophylline toxicity",
        "mechanism": "Ciprofloxacin inhibits CYP1A2, reducing theophylline metabolism",
        "recommendation": "Reduce theophylline dose by 30-50%. Monitor theophylline levels.",
    },
    ("metoprolol", "verapamil"): {
        "severity": "major",
        "effect": "Severe bradycardia, heart block, heart failure",
        "mechanism": "Additive negative chronotropic and inotropic effects",
        "recommendation": "Avoid IV combination. Oral combination requires careful monitoring of heart rate and BP.",
    },
    ("amlodipine", "simvastatin"): {
        "severity": "moderate",
        "effect": "Increased statin levels and myopathy risk",
        "mechanism": "Amlodipine inhibits CYP3A4, increasing simvastatin exposure",
        "recommendation": "Limit simvastatin to 20mg/day when co-administered with amlodipine.",
    },
    ("omeprazole", "clopidogrel"): {
        "severity": "major",
        "effect": "Reduced antiplatelet effect",
        "mechanism": "Omeprazole inhibits CYP2C19, reducing clopidogrel activation",
        "recommendation": "Use pantoprazole instead of omeprazole. Separate dosing by 12 hours if PPI required.",
    },
}


class ClinicalDecisionSupport:
    """
    AI-powered clinical decision support system providing
    evidence-based treatment protocols, drug interaction checking,
    and clinical guideline recommendations.
    """

    def __init__(self):
        self.guidelines = CLINICAL_GUIDELINES
        self.interactions = DRUG_INTERACTION_DB

    async def get_clinical_guidance(
        self,
        condition: str,
        patient_vitals: Optional[Dict] = None,
        patient_medications: Optional[List[str]] = None,
        patient_allergies: Optional[List[str]] = None,
        patient_age: Optional[int] = None,
    ) -> Dict:
        """Get evidence-based clinical guidance for a condition."""
        condition_key = condition.lower().replace(" ", "_")
        
        # Find matching guideline
        guideline = None
        matched_key = None
        for key, value in self.guidelines.items():
            if key in condition_key or condition_key in key:
                guideline = value
                matched_key = key
                break
            if condition.lower() in value.get("condition", "").lower():
                guideline = value
                matched_key = key
                break
        
        if not guideline:
            return {
                "found": False,
                "message": f"No specific protocol found for '{condition}'. Recommend clinical evaluation.",
                "general_recommendations": [
                    "Perform thorough history and physical examination",
                    "Order appropriate diagnostic workup based on clinical presentation",
                    "Consider specialist consultation if condition is outside primary scope",
                    "Document clinical reasoning and differential diagnosis",
                ],
            }
        
        result = {
            "found": True,
            "condition": guideline.get("condition"),
            "icd10": guideline.get("icd10"),
            "guideline": guideline,
            "drug_interactions": [],
            "allergy_alerts": [],
            "age_considerations": [],
        }
        
        # Check drug interactions with current medications
        if patient_medications:
            result["drug_interactions"] = self._check_medication_interactions(
                guideline, patient_medications
            )
        
        # Check allergies
        if patient_allergies:
            result["allergy_alerts"] = self._check_allergies(guideline, patient_allergies)
        
        # Age-specific considerations
        if patient_age:
            result["age_considerations"] = self._age_adjustments(matched_key, patient_age)
        
        return result

    async def check_drug_interactions(self, medications: List[str]) -> Dict:
        """Check for drug interactions between a list of medications."""
        interactions_found = []
        checked_pairs = set()
        
        meds_lower = [m.lower().strip() for m in medications]
        
        for i, med_a in enumerate(meds_lower):
            for j, med_b in enumerate(meds_lower):
                if i >= j:
                    continue
                pair_key = tuple(sorted([med_a, med_b]))
                if pair_key in checked_pairs:
                    continue
                checked_pairs.add(pair_key)
                
                # Check against interaction database
                for (drug_a, drug_b), interaction in self.interactions.items():
                    if (drug_a in med_a or med_a in drug_a) and (drug_b in med_b or med_b in drug_b):
                        interactions_found.append({
                            "drug_a": medications[i],
                            "drug_b": medications[j],
                            **interaction,
                        })
                    elif (drug_b in med_a or med_a in drug_b) and (drug_a in med_b or med_b in drug_a):
                        interactions_found.append({
                            "drug_a": medications[i],
                            "drug_b": medications[j],
                            **interaction,
                        })
        
        # Sort by severity
        severity_order = {"contraindicated": 0, "major": 1, "moderate": 2, "minor": 3}
        interactions_found.sort(key=lambda x: severity_order.get(x.get("severity", "minor"), 4))
        
        has_critical = any(i["severity"] in ("contraindicated", "major") for i in interactions_found)
        
        return {
            "medications_checked": medications,
            "total_interactions": len(interactions_found),
            "has_critical_interactions": has_critical,
            "interactions": interactions_found,
            "checked_at": datetime.utcnow().isoformat(),
        }

    def _check_medication_interactions(self, guideline: Dict, current_meds: List[str]) -> List[Dict]:
        alerts = []
        # Get all recommended medications from guideline
        recommended = []
        for key in ["first_line", "second_line", "outpatient", "inpatient_nonsevere",
                     "mild_moderate", "severe"]:
            if key in guideline:
                recommended.extend(guideline[key])
        
        for rec_med in recommended:
            rec_lower = rec_med.lower()
            for current_med in current_meds:
                current_lower = current_med.lower()
                for (drug_a, drug_b), interaction in self.interactions.items():
                    if ((drug_a in rec_lower and drug_b in current_lower) or
                        (drug_b in rec_lower and drug_a in current_lower)):
                        alerts.append({
                            "recommended": rec_med,
                            "current": current_med,
                            **interaction,
                        })
        return alerts

    def _check_allergies(self, guideline: Dict, allergies: List[str]) -> List[str]:
        alerts = []
        recommended = []
        for key in ["first_line", "second_line", "outpatient", "inpatient_nonsevere"]:
            if key in guideline:
                recommended.extend(guideline[key])
        
        for allergy in allergies:
            allergy_lower = allergy.lower()
            for med in recommended:
                if allergy_lower in med.lower():
                    alerts.append(
                        f"ALLERGY ALERT: Patient is allergic to {allergy}. "
                        f"Recommended medication '{med}' may be contraindicated."
                    )
        
        # Common cross-reactivities
        penicillin_drugs = ["amoxicillin", "ampicillin", "piperacillin"]
        if any("penicillin" in a.lower() for a in allergies):
            for med in recommended:
                if any(p in med.lower() for p in penicillin_drugs):
                    alerts.append(
                        f"CROSS-REACTIVITY ALERT: Patient has penicillin allergy. "
                        f"'{med}' is a penicillin-class antibiotic. Consider alternative."
                    )
        
        return alerts

    def _age_adjustments(self, condition_key: str, age: int) -> List[str]:
        adjustments = []
        
        if age >= 65:
            adjustments.append("Geriatric consideration: Start with lower doses and titrate slowly.")
            adjustments.append("Monitor renal function — dose adjustments may be needed.")
            adjustments.append("Fall risk assessment recommended with new medications.")
            if condition_key == "hypertension":
                adjustments.append("Target BP may be relaxed to <140/90 for patients >80 years.")
            if condition_key == "diabetes_type2":
                adjustments.append("HbA1c target may be relaxed to <8.0% for frail elderly.")
        
        if age < 18:
            adjustments.append("Pediatric dosing required. Weight-based calculations recommended.")
            adjustments.append("Some medications may not be approved for pediatric use.")
        
        if age < 12:
            adjustments.append("Pediatric specialist consultation recommended.")
        
        return adjustments


clinical_decision_support = ClinicalDecisionSupport()
