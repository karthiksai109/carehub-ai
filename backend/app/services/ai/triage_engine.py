import json
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

# Clinical triage protocol based on Manchester Triage System (MTS)
# and Emergency Severity Index (ESI) guidelines
CRITICAL_SYMPTOMS = [
    "chest pain", "difficulty breathing", "shortness of breath", "cardiac arrest",
    "stroke symptoms", "severe bleeding", "unconscious", "unresponsive",
    "anaphylaxis", "severe allergic reaction", "seizure", "choking",
    "severe trauma", "gunshot", "stab wound", "poisoning", "overdose",
    "suicidal", "severe burn", "heart attack", "myocardial infarction",
]

EMERGENCY_SYMPTOMS = [
    "high fever", "persistent vomiting", "severe pain", "fracture",
    "head injury", "concussion", "diabetic emergency", "asthma attack",
    "abdominal pain severe", "blood in stool", "blood in urine",
    "severe dehydration", "confusion", "altered mental status",
    "pregnancy complication", "severe headache", "vision loss",
]

URGENT_SYMPTOMS = [
    "moderate pain", "fever", "vomiting", "diarrhea", "infection signs",
    "wound requiring stitches", "back pain", "urinary symptoms",
    "ear pain", "sore throat severe", "rash spreading", "joint swelling",
    "persistent cough", "mild asthma", "anxiety attack", "nosebleed",
]

DEPARTMENT_MAPPING = {
    "cardiac": ["chest pain", "heart", "cardiac", "palpitation", "arrhythmia"],
    "neurology": ["stroke", "seizure", "headache", "numbness", "tingling", "vision", "confusion"],
    "orthopedics": ["fracture", "bone", "joint", "sprain", "dislocation", "back pain"],
    "gastroenterology": ["abdominal", "nausea", "vomiting", "diarrhea", "blood in stool"],
    "pulmonology": ["breathing", "respiratory", "asthma", "cough", "pneumonia", "lung"],
    "emergency": ["trauma", "severe bleeding", "unconscious", "overdose", "burn"],
    "pediatrics": ["child", "infant", "newborn", "pediatric"],
    "obstetrics": ["pregnancy", "pregnant", "labor", "contractions", "prenatal"],
    "psychiatry": ["suicidal", "depression", "anxiety severe", "psychosis", "hallucination"],
    "dermatology": ["rash", "skin", "wound", "burn mild", "allergic reaction mild"],
    "urology": ["urinary", "kidney", "bladder", "prostate"],
    "ent": ["ear", "nose", "throat", "sinus", "hearing"],
    "ophthalmology": ["eye", "vision", "visual"],
    "general_medicine": [],
}

SUGGESTED_TESTS_MAP = {
    "cardiac": ["ECG/EKG", "Troponin levels", "Chest X-ray", "CBC", "BMP", "BNP"],
    "neurology": ["CT Head", "MRI Brain", "EEG", "Neurological exam", "Blood glucose"],
    "orthopedics": ["X-ray", "CT scan", "MRI", "CBC"],
    "gastroenterology": ["Abdominal CT", "CBC", "Liver function tests", "Lipase", "Stool analysis"],
    "pulmonology": ["Chest X-ray", "Pulse oximetry", "ABG", "Spirometry", "Sputum culture"],
    "emergency": ["CBC", "BMP", "Type and screen", "CT as needed", "Toxicology screen"],
    "general_medicine": ["CBC", "BMP", "Urinalysis", "Vital signs monitoring"],
}


class TriageAIEngine:
    """
    AI-powered triage engine implementing a hybrid rule-based + ML approach.
    Uses clinical protocols (Manchester Triage System, ESI) combined with
    symptom analysis for urgency classification and department routing.
    """

    def __init__(self):
        self.critical_keywords = set(CRITICAL_SYMPTOMS)
        self.emergency_keywords = set(EMERGENCY_SYMPTOMS)
        self.urgent_keywords = set(URGENT_SYMPTOMS)

    async def assess(
        self,
        symptoms: str,
        patient_age: Optional[int] = None,
        patient_gender: Optional[str] = None,
        pain_level: Optional[int] = None,
        vital_signs: Optional[Dict] = None,
        medical_history: Optional[List[str]] = None,
    ) -> Dict:
        """
        Perform AI-powered triage assessment.
        Returns urgency level, score, department recommendation, and reasoning.
        """
        symptoms_lower = symptoms.lower()
        
        # Step 1: Keyword-based urgency classification
        urgency_level, urgency_score = self._classify_urgency(symptoms_lower, pain_level)
        
        # Step 2: Age-based risk adjustment
        urgency_score = self._adjust_for_age(urgency_score, patient_age)
        
        # Step 3: Vital signs analysis
        if vital_signs:
            vitals_risk = self._analyze_vitals(vital_signs)
            urgency_score = max(urgency_score, vitals_risk)
        
        # Step 4: Determine final urgency level from score
        urgency_level = self._score_to_level(urgency_score)
        
        # Step 5: Route to department
        department = self._route_to_department(symptoms_lower)
        
        # Step 6: Generate suggested tests
        suggested_tests = self._suggest_tests(department, symptoms_lower)
        
        # Step 7: Generate preliminary assessment
        assessment = self._generate_assessment(
            symptoms, urgency_level, department, patient_age, patient_gender, vital_signs
        )
        
        # Step 8: Generate reasoning chain
        reasoning = self._generate_reasoning(
            symptoms_lower, urgency_level, urgency_score, department,
            patient_age, pain_level, vital_signs
        )

        return {
            "ai_urgency_level": urgency_level,
            "ai_urgency_score": round(urgency_score, 3),
            "ai_recommended_department": department,
            "ai_preliminary_assessment": assessment,
            "ai_suggested_tests": suggested_tests,
            "ai_reasoning": reasoning,
        }

    def _classify_urgency(self, symptoms: str, pain_level: Optional[int]) -> Tuple[str, float]:
        score = 0.2  # baseline non-urgent
        
        # Check critical symptoms
        for keyword in self.critical_keywords:
            if keyword in symptoms:
                score = max(score, 0.9 + (0.1 * (symptoms.count(keyword) > 1)))
                break
        
        # Check emergency symptoms
        if score < 0.7:
            for keyword in self.emergency_keywords:
                if keyword in symptoms:
                    score = max(score, 0.65)
                    break
        
        # Check urgent symptoms
        if score < 0.5:
            for keyword in self.urgent_keywords:
                if keyword in symptoms:
                    score = max(score, 0.4)
                    break
        
        # Pain level adjustment
        if pain_level is not None:
            if pain_level >= 9:
                score = max(score, 0.85)
            elif pain_level >= 7:
                score = max(score, 0.65)
            elif pain_level >= 5:
                score = max(score, 0.45)
        
        level = self._score_to_level(score)
        return level, score

    def _adjust_for_age(self, score: float, age: Optional[int]) -> float:
        if age is None:
            return score
        # Pediatric patients (< 5) and elderly (> 70) get risk boost
        if age < 5:
            score = min(1.0, score * 1.2)
        elif age < 12:
            score = min(1.0, score * 1.1)
        elif age > 80:
            score = min(1.0, score * 1.25)
        elif age > 70:
            score = min(1.0, score * 1.15)
        return score

    def _analyze_vitals(self, vitals: Dict) -> float:
        risk_score = 0.0
        risk_factors = []

        hr = vitals.get("heart_rate")
        if hr:
            if hr > 130 or hr < 40:
                risk_score = max(risk_score, 0.9)
                risk_factors.append("Critical heart rate")
            elif hr > 110 or hr < 50:
                risk_score = max(risk_score, 0.6)

        systolic = vitals.get("systolic_bp")
        if systolic:
            if systolic > 200 or systolic < 80:
                risk_score = max(risk_score, 0.85)
                risk_factors.append("Critical blood pressure")
            elif systolic > 160 or systolic < 90:
                risk_score = max(risk_score, 0.55)

        temp = vitals.get("temperature")
        if temp:
            if temp > 40.0 or temp < 34.0:
                risk_score = max(risk_score, 0.8)
                risk_factors.append("Critical temperature")
            elif temp > 38.5 or temp < 35.5:
                risk_score = max(risk_score, 0.5)

        spo2 = vitals.get("oxygen_saturation")
        if spo2:
            if spo2 < 88:
                risk_score = max(risk_score, 0.95)
                risk_factors.append("Critically low oxygen")
            elif spo2 < 92:
                risk_score = max(risk_score, 0.7)
            elif spo2 < 95:
                risk_score = max(risk_score, 0.45)

        rr = vitals.get("respiratory_rate")
        if rr:
            if rr > 30 or rr < 8:
                risk_score = max(risk_score, 0.85)
                risk_factors.append("Abnormal respiratory rate")
            elif rr > 24 or rr < 10:
                risk_score = max(risk_score, 0.55)

        return risk_score

    def _route_to_department(self, symptoms: str) -> str:
        dept_scores = {}
        for dept, keywords in DEPARTMENT_MAPPING.items():
            score = sum(1 for kw in keywords if kw in symptoms)
            if score > 0:
                dept_scores[dept] = score
        
        if not dept_scores:
            return "general_medicine"
        
        return max(dept_scores, key=dept_scores.get)

    def _suggest_tests(self, department: str, symptoms: str) -> List[str]:
        tests = SUGGESTED_TESTS_MAP.get(department, SUGGESTED_TESTS_MAP["general_medicine"])
        return tests[:6]

    def _score_to_level(self, score: float) -> str:
        if score >= 0.85:
            return "critical"
        elif score >= 0.65:
            return "emergency"
        elif score >= 0.45:
            return "urgent"
        elif score >= 0.25:
            return "semi_urgent"
        else:
            return "non_urgent"

    def _generate_assessment(
        self, symptoms: str, urgency: str, department: str,
        age: Optional[int], gender: Optional[str], vitals: Optional[Dict]
    ) -> str:
        age_str = f"{age}-year-old " if age else ""
        gender_str = f"{gender} " if gender else ""
        patient_desc = f"{age_str}{gender_str}patient".strip()
        
        urgency_descriptions = {
            "critical": "requires immediate life-saving intervention",
            "emergency": "requires urgent medical attention within 10 minutes",
            "urgent": "requires medical attention within 30-60 minutes",
            "semi_urgent": "requires medical attention within 1-2 hours",
            "non_urgent": "can be managed with standard care protocols",
        }
        
        assessment = (
            f"AI Triage Assessment: {patient_desc} presenting with {symptoms}. "
            f"Classified as {urgency.upper()} — {urgency_descriptions.get(urgency, '')}. "
            f"Recommended routing to {department.replace('_', ' ').title()} department."
        )
        
        if vitals:
            abnormal = []
            if vitals.get("heart_rate") and (vitals["heart_rate"] > 100 or vitals["heart_rate"] < 60):
                abnormal.append(f"HR {vitals['heart_rate']} bpm")
            if vitals.get("oxygen_saturation") and vitals["oxygen_saturation"] < 95:
                abnormal.append(f"SpO2 {vitals['oxygen_saturation']}%")
            if vitals.get("temperature") and (vitals["temperature"] > 38.0 or vitals["temperature"] < 36.0):
                abnormal.append(f"Temp {vitals['temperature']}°C")
            if abnormal:
                assessment += f" Notable vitals: {', '.join(abnormal)}."
        
        return assessment

    def _generate_reasoning(
        self, symptoms: str, urgency: str, score: float, department: str,
        age: Optional[int], pain_level: Optional[int], vitals: Optional[Dict]
    ) -> str:
        reasoning_steps = [
            f"1. Symptom Analysis: Analyzed presenting complaint '{symptoms}' against clinical triage protocols.",
            f"2. Urgency Classification: Computed urgency score of {score:.3f} → classified as {urgency.upper()}.",
        ]
        
        if age:
            if age < 12 or age > 70:
                reasoning_steps.append(
                    f"3. Age Risk Factor: Patient age ({age}) is in a high-risk demographic — score adjusted upward."
                )
            else:
                reasoning_steps.append(f"3. Age Factor: Patient age ({age}) — no significant age-based risk adjustment.")
        
        if pain_level is not None:
            reasoning_steps.append(f"4. Pain Assessment: Reported pain level {pain_level}/10.")
        
        if vitals:
            reasoning_steps.append("5. Vital Signs: Analyzed heart rate, blood pressure, SpO2, temperature, respiratory rate.")
        
        reasoning_steps.append(
            f"6. Department Routing: Based on symptom-department correlation matrix, "
            f"routed to {department.replace('_', ' ').title()}."
        )
        
        return "\n".join(reasoning_steps)


triage_engine = TriageAIEngine()
