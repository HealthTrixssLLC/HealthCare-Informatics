"""FHIR data aggregation and transformation utilities."""
from typing import Dict, Any, List, Optional
from datetime import datetime
from statistics import median

from app.models import (
    SourceDataset, PatientAggregate, ObservationAggregate,
    ConditionAggregate, DemographicSummary, DatasetMetadata
)


def aggregate_fhir_data(fhir_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """
    Aggregate FHIR data into summarized format for AI analysis.
    Reduces data size from ~270KB to ~2-5KB.
    """
    aggregated = {}
    
    # Aggregate patient data
    if "patients" in fhir_data and fhir_data["patients"]:
        patients = fhir_data["patients"]
        
        gender_dist = {}
        ages = []
        
        for patient in patients:
            gender = patient.get("gender", "unknown")
            gender_dist[gender] = gender_dist.get(gender, 0) + 1
            
            # Calculate age from birthDate
            if birth_date := patient.get("birthDate"):
                try:
                    birth_year = datetime.fromisoformat(birth_date).year
                    age = datetime.now().year - birth_year
                    if 0 <= age < 120:
                        ages.append(age)
                except Exception:
                    pass
        
        # Age groups
        age_groups = {
            "0-18": 0,
            "19-30": 0,
            "31-50": 0,
            "51-70": 0,
            "70+": 0
        }
        
        for age in ages:
            if age <= 18:
                age_groups["0-18"] += 1
            elif age <= 30:
                age_groups["19-30"] += 1
            elif age <= 50:
                age_groups["31-50"] += 1
            elif age <= 70:
                age_groups["51-70"] += 1
            else:
                age_groups["70+"] += 1
        
        avg_age = round(sum(ages) / len(ages), 1) if ages else None
        median_age = int(median(ages)) if ages else None
        
        aggregated["patients"] = {
            "totalCount": len(patients),
            "demographics": {
                "genderDistribution": gender_dist,
                "ageGroups": age_groups,
                "averageAge": avg_age,
                "medianAge": median_age
            },
            "sampleRecords": patients[:5]
        }
    
    # Aggregate observation data
    if "observations" in fhir_data and fhir_data["observations"]:
        observations = fhir_data["observations"]
        
        category_count = {}
        code_count = {}
        
        for obs in observations:
            # Category
            category = "unknown"
            if cat_list := obs.get("category"):
                if coding := cat_list[0].get("coding"):
                    category = coding[0].get("display") or cat_list[0].get("text", "unknown")
                else:
                    category = cat_list[0].get("text", "unknown")
            
            category_count[category] = category_count.get(category, 0) + 1
            
            # Code
            if code_obj := obs.get("code"):
                if coding := code_obj.get("coding"):
                    code = coding[0].get("code")
                    display = coding[0].get("display") or code_obj.get("text")
                else:
                    code = code_obj.get("text")
                    display = code
                
                if code:
                    if code not in code_count:
                        code_count[code] = {"count": 0, "display": display}
                    code_count[code]["count"] += 1
        
        # Top 10 common tests
        common_tests = sorted(
            [{"code": code, **data} for code, data in code_count.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]
        
        aggregated["observations"] = {
            "totalCount": len(observations),
            "byCategory": category_count,
            "commonTests": common_tests,
            "sampleRecords": observations[:5]
        }
    
    # Aggregate condition data
    if "conditions" in fhir_data and fhir_data["conditions"]:
        conditions = fhir_data["conditions"]
        
        condition_count = {}
        severity_dist = {}
        
        for cond in conditions:
            # Condition code
            if code_obj := cond.get("code"):
                if coding := code_obj.get("coding"):
                    code = coding[0].get("code")
                    display = coding[0].get("display") or code_obj.get("text")
                else:
                    code = code_obj.get("text")
                    display = code
                
                if code:
                    if code not in condition_count:
                        condition_count[code] = {"count": 0, "display": display}
                    condition_count[code]["count"] += 1
            
            # Severity
            severity = "unknown"
            if sev_obj := cond.get("severity"):
                if coding := sev_obj.get("coding"):
                    severity = coding[0].get("display", "unknown")
                else:
                    severity = sev_obj.get("text", "unknown")
            
            severity_dist[severity] = severity_dist.get(severity, 0) + 1
        
        # Top 15 conditions
        top_conditions = sorted(
            [{"code": code, **data} for code, data in condition_count.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:15]
        
        aggregated["conditions"] = {
            "totalCount": len(conditions),
            "topConditions": top_conditions,
            "severityDistribution": severity_dist,
            "sampleRecords": conditions[:5]
        }
    
    return aggregated


def create_source_dataset(fhir_data: Dict[str, List[Dict[str, Any]]]) -> SourceDataset:
    """
    Create normalized source dataset for client-side filtering and interactions.
    """
    source_data = SourceDataset()
    
    # Transform patients
    if "patients" in fhir_data and fhir_data["patients"]:
        patients = []
        for patient in fhir_data["patients"]:
            birth_date_str = patient.get("birthDate")
            age = None
            age_group = None
            
            if birth_date_str:
                try:
                    birth_year = datetime.fromisoformat(birth_date_str).year
                    age = datetime.now().year - birth_year
                    
                    if age <= 18:
                        age_group = "0-18"
                    elif age <= 30:
                        age_group = "19-30"
                    elif age <= 50:
                        age_group = "31-50"
                    elif age <= 70:
                        age_group = "51-70"
                    else:
                        age_group = "70+"
                except Exception:
                    pass
            
            patients.append(PatientAggregate(
                id=patient.get("id"),
                gender=patient.get("gender"),
                age_group=age_group,
                age=age,
                birth_date=birth_date_str
            ))
        
        source_data.patients = patients
    
    # Transform observations
    if "observations" in fhir_data and fhir_data["observations"]:
        observations = []
        for obs in fhir_data["observations"]:
            patient_id = None
            if subject := obs.get("subject"):
                if ref := subject.get("reference"):
                    patient_id = ref.split("/")[-1]
            
            category = None
            if cat_list := obs.get("category"):
                if coding := cat_list[0].get("coding"):
                    category = coding[0].get("display") or cat_list[0].get("text")
                else:
                    category = cat_list[0].get("text")
            
            code = None
            display = None
            if code_obj := obs.get("code"):
                if coding := code_obj.get("coding"):
                    code = coding[0].get("code")
                    display = coding[0].get("display") or code_obj.get("text")
                else:
                    code = code_obj.get("text")
                    display = code
            
            value = None
            unit = None
            if val_qty := obs.get("valueQuantity"):
                value = val_qty.get("value")
                unit = val_qty.get("unit")
            
            observations.append(ObservationAggregate(
                id=obs.get("id"),
                patient_id=patient_id,
                category=category,
                code=code,
                display=display,
                value=value,
                unit=unit,
                date=obs.get("effectiveDateTime")
            ))
        
        source_data.observations = observations
    
    # Transform conditions
    if "conditions" in fhir_data and fhir_data["conditions"]:
        conditions = []
        for cond in fhir_data["conditions"]:
            patient_id = None
            if subject := cond.get("subject"):
                if ref := subject.get("reference"):
                    patient_id = ref.split("/")[-1]
            
            code = None
            display = None
            if code_obj := cond.get("code"):
                if coding := code_obj.get("coding"):
                    code = coding[0].get("code")
                    display = coding[0].get("display") or code_obj.get("text")
                else:
                    code = code_obj.get("text")
                    display = code
            
            severity = None
            if sev_obj := cond.get("severity"):
                if coding := sev_obj.get("coding"):
                    severity = coding[0].get("display")
                else:
                    severity = sev_obj.get("text")
            
            category = None
            if cat_list := cond.get("category"):
                if coding := cat_list[0].get("coding"):
                    category = coding[0].get("display") or cat_list[0].get("text")
                else:
                    category = cat_list[0].get("text")
            
            conditions.append(ConditionAggregate(
                id=cond.get("id"),
                patient_id=patient_id,
                code=code,
                display=display,
                severity=severity,
                category=category,
                onset_date=cond.get("onsetDateTime")
            ))
        
        source_data.conditions = conditions
    
    # Create demographic summary
    if source_data.patients:
        gender_dist = {}
        age_groups = {
            "0-18": 0,
            "19-30": 0,
            "31-50": 0,
            "51-70": 0,
            "70+": 0
        }
        ages = []
        
        for patient in source_data.patients:
            if patient.gender:
                gender_dist[patient.gender] = gender_dist.get(patient.gender, 0) + 1
            if patient.age_group:
                age_groups[patient.age_group] += 1
            if patient.age is not None:
                ages.append(patient.age)
        
        avg_age = round(sum(ages) / len(ages), 1) if ages else None
        median_age = int(median(ages)) if ages else None
        
        source_data.demographics = DemographicSummary(
            total_patients=len(source_data.patients),
            gender_distribution=gender_dist,
            age_groups=age_groups,
            average_age=avg_age,
            median_age=median_age
        )
    
    # Create metadata
    source_data.metadata = DatasetMetadata(
        generated_at=datetime.utcnow().isoformat(),
        patient_count=len(source_data.patients) if source_data.patients else 0,
        observation_count=len(source_data.observations) if source_data.observations else 0,
        condition_count=len(source_data.conditions) if source_data.conditions else 0,
        data_source="HAPI FHIR R4"
    )
    
    return source_data
