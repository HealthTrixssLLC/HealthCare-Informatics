import type { 
  FHIRPatient, 
  FHIRObservation, 
  FHIRCondition,
  SourceDataset,
  PatientAggregate,
  ObservationAggregate,
  ConditionAggregate,
  DemographicSummary,
  DatasetMetadata
} from '@shared/schema';

/**
 * Aggregates FHIR data into a summarized format suitable for AI analysis
 * Instead of sending 500 full patient records, we send statistics and key insights
 */

export interface AggregatedFHIRData {
  patients?: {
    totalCount: number;
    demographics: {
      genderDistribution: Record<string, number>;
      ageGroups: Record<string, number>;
      averageAge?: number;
      medianAge?: number;
    };
    sampleRecords: any[]; // A small sample for context
  };
  observations?: {
    totalCount: number;
    byCategory: Record<string, number>;
    commonTests: Array<{ code: string; count: number; display?: string }>;
    sampleRecords: any[];
  };
  conditions?: {
    totalCount: number;
    topConditions: Array<{ code: string; count: number; display?: string }>;
    severityDistribution: Record<string, number>;
    sampleRecords: any[];
  };
}

export function aggregateFHIRData(fhirData: {
  patients?: FHIRPatient[];
  observations?: FHIRObservation[];
  conditions?: FHIRCondition[];
}): AggregatedFHIRData {
  const aggregated: AggregatedFHIRData = {};

  // Aggregate patient data
  if (fhirData.patients && fhirData.patients.length > 0) {
    const patients = fhirData.patients;
    
    // Gender distribution
    const genderDist: Record<string, number> = {};
    const ages: number[] = [];
    
    patients.forEach((patient: any) => {
      const gender = patient.gender || 'unknown';
      genderDist[gender] = (genderDist[gender] || 0) + 1;
      
      // Calculate age from birthDate
      if (patient.birthDate) {
        const birthDate = new Date(patient.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age >= 0 && age < 120) {
          ages.push(age);
        }
      }
    });

    // Age groups
    const ageGroups: Record<string, number> = {
      '0-18': 0,
      '19-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    };
    
    ages.forEach(age => {
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 30) ageGroups['19-30']++;
      else if (age <= 50) ageGroups['31-50']++;
      else if (age <= 70) ageGroups['51-70']++;
      else ageGroups['70+']++;
    });

    // Calculate average and median age
    const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : undefined;
    const sortedAges = [...ages].sort((a, b) => a - b);
    const medianAge = sortedAges.length > 0 
      ? sortedAges[Math.floor(sortedAges.length / 2)] 
      : undefined;

    aggregated.patients = {
      totalCount: patients.length,
      demographics: {
        genderDistribution: genderDist,
        ageGroups,
        averageAge: avgAge ? Math.round(avgAge * 10) / 10 : undefined,
        medianAge
      },
      // Include 5 sample records for context
      sampleRecords: patients.slice(0, 5)
    };
  }

  // Aggregate observation data
  if (fhirData.observations && fhirData.observations.length > 0) {
    const observations = fhirData.observations;
    
    const categoryCount: Record<string, number> = {};
    const codeCount: Map<string, { count: number; display?: string }> = new Map();
    
    observations.forEach((obs: any) => {
      const category = obs.category?.[0]?.coding?.[0]?.display || obs.category?.[0]?.text || 'unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      const code = obs.code?.coding?.[0]?.code || obs.code?.text;
      const display = obs.code?.coding?.[0]?.display || obs.code?.text;
      if (code) {
        const existing = codeCount.get(code) || { count: 0, display };
        codeCount.set(code, { count: existing.count + 1, display });
      }
    });

    // Get top 10 most common tests
    const commonTests = Array.from(codeCount.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([code, data]) => ({ code, ...data }));

    aggregated.observations = {
      totalCount: observations.length,
      byCategory: categoryCount,
      commonTests,
      sampleRecords: observations.slice(0, 5)
    };
  }

  // Aggregate condition data
  if (fhirData.conditions && fhirData.conditions.length > 0) {
    const conditions = fhirData.conditions;
    
    const conditionCount: Map<string, { count: number; display?: string }> = new Map();
    const severityDist: Record<string, number> = {};
    
    conditions.forEach((cond: any) => {
      const code = cond.code?.coding?.[0]?.code || cond.code?.text;
      const display = cond.code?.coding?.[0]?.display || cond.code?.text;
      if (code) {
        const existing = conditionCount.get(code) || { count: 0, display };
        conditionCount.set(code, { count: existing.count + 1, display });
      }
      
      const severity = cond.severity?.coding?.[0]?.display || cond.severity?.text || 'unknown';
      severityDist[severity] = (severityDist[severity] || 0) + 1;
    });

    // Get top 15 most common conditions
    const topConditions = Array.from(conditionCount.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([code, data]) => ({ code, ...data }));

    aggregated.conditions = {
      totalCount: conditions.length,
      topConditions,
      severityDistribution: severityDist,
      sampleRecords: conditions.slice(0, 5)
    };
  }

  return aggregated;
}

/**
 * Creates a normalized source dataset for client-side filtering and interactions
 * This provides the raw data in a structured format that can be filtered dynamically
 */
export function createSourceDataset(fhirData: {
  patients?: FHIRPatient[];
  observations?: FHIRObservation[];
  conditions?: FHIRCondition[];
}): SourceDataset {
  const sourceData: SourceDataset = {};

  // Transform patients into normalized format
  if (fhirData.patients && fhirData.patients.length > 0) {
    sourceData.patients = fhirData.patients.map((patient: any): PatientAggregate => {
      const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;
      const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : undefined;
      
      let ageGroup: string | undefined;
      if (age !== undefined) {
        if (age <= 18) ageGroup = '0-18';
        else if (age <= 30) ageGroup = '19-30';
        else if (age <= 50) ageGroup = '31-50';
        else if (age <= 70) ageGroup = '51-70';
        else ageGroup = '70+';
      }

      return {
        id: patient.id,
        gender: patient.gender,
        ageGroup,
        age,
        birthDate: patient.birthDate
      };
    });
  }

  // Transform observations into normalized format
  if (fhirData.observations && fhirData.observations.length > 0) {
    sourceData.observations = fhirData.observations.map((obs: any): ObservationAggregate => {
      return {
        id: obs.id,
        patientId: obs.subject?.reference?.split('/')?.[1],
        category: obs.category?.[0]?.coding?.[0]?.display || obs.category?.[0]?.text,
        code: obs.code?.coding?.[0]?.code || obs.code?.text,
        display: obs.code?.coding?.[0]?.display || obs.code?.text,
        value: obs.valueQuantity?.value,
        unit: obs.valueQuantity?.unit,
        date: obs.effectiveDateTime
      };
    });
  }

  // Transform conditions into normalized format
  if (fhirData.conditions && fhirData.conditions.length > 0) {
    sourceData.conditions = fhirData.conditions.map((cond: any): ConditionAggregate => {
      return {
        id: cond.id,
        patientId: cond.subject?.reference?.split('/')?.[1],
        code: cond.code?.coding?.[0]?.code || cond.code?.text,
        display: cond.code?.coding?.[0]?.display || cond.code?.text,
        severity: cond.severity?.coding?.[0]?.display || cond.severity?.text,
        category: cond.category?.[0]?.coding?.[0]?.display || cond.category?.[0]?.text,
        onsetDate: cond.onsetDateTime
      };
    });
  }

  // Create demographic summary
  if (sourceData.patients && sourceData.patients.length > 0) {
    const genderDist: Record<string, number> = {};
    const ageGroups: Record<string, number> = {
      '0-18': 0,
      '19-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    };
    const ages: number[] = [];

    sourceData.patients.forEach(patient => {
      if (patient.gender) {
        genderDist[patient.gender] = (genderDist[patient.gender] || 0) + 1;
      }
      if (patient.ageGroup) {
        ageGroups[patient.ageGroup]++;
      }
      if (patient.age !== undefined) {
        ages.push(patient.age);
      }
    });

    const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : undefined;
    const sortedAges = [...ages].sort((a, b) => a - b);
    const medianAge = sortedAges.length > 0 
      ? sortedAges[Math.floor(sortedAges.length / 2)] 
      : undefined;

    sourceData.demographics = {
      totalPatients: sourceData.patients.length,
      genderDistribution: genderDist,
      ageGroups,
      averageAge: avgAge ? Math.round(avgAge * 10) / 10 : undefined,
      medianAge
    };
  }

  // Create metadata
  sourceData.metadata = {
    generatedAt: new Date().toISOString(),
    patientCount: sourceData.patients?.length || 0,
    observationCount: sourceData.observations?.length || 0,
    conditionCount: sourceData.conditions?.length || 0,
    dataSource: 'HAPI FHIR R4'
  };

  return sourceData;
}
