import type { 
  SourceDataset, 
  PatientAggregate, 
  ObservationAggregate, 
  ConditionAggregate 
} from '@shared/schema';

/**
 * Applies active filters to a source dataset
 * Returns a filtered version of the dataset based on filter criteria
 */
export function applyFiltersToDataset(
  sourceData: SourceDataset,
  activeFilters: Record<string, any>
): SourceDataset {
  if (!sourceData || Object.keys(activeFilters).length === 0) {
    return sourceData;
  }

  const filtered: SourceDataset = {
    ...sourceData,
    patients: sourceData.patients ? filterPatients(sourceData.patients, activeFilters) : undefined,
    observations: sourceData.observations ? filterObservations(sourceData.observations, activeFilters, sourceData.patients) : undefined,
    conditions: sourceData.conditions ? filterConditions(sourceData.conditions, activeFilters, sourceData.patients) : undefined,
  };

  // Recalculate demographics for filtered dataset
  if (filtered.patients && filtered.patients.length > 0) {
    filtered.demographics = calculateDemographics(filtered.patients);
  }

  // Update metadata
  if (filtered.metadata) {
    filtered.metadata = {
      ...filtered.metadata,
      patientCount: filtered.patients?.length || 0,
      observationCount: filtered.observations?.length || 0,
      conditionCount: filtered.conditions?.length || 0,
    };
  }

  return filtered;
}

function filterPatients(
  patients: PatientAggregate[],
  activeFilters: Record<string, any>
): PatientAggregate[] {
  return patients.filter(patient => {
    // Gender filter
    if (activeFilters.gender && Array.isArray(activeFilters.gender) && activeFilters.gender.length > 0) {
      if (!patient.gender || !activeFilters.gender.includes(patient.gender)) {
        return false;
      }
    }

    // Age group filter
    if (activeFilters.ageGroup && Array.isArray(activeFilters.ageGroup) && activeFilters.ageGroup.length > 0) {
      if (!patient.ageGroup || !activeFilters.ageGroup.includes(patient.ageGroup)) {
        return false;
      }
    }

    // Age range filter (if using numberrange type)
    if (activeFilters.ageRange && Array.isArray(activeFilters.ageRange) && activeFilters.ageRange.length === 2) {
      const [min, max] = activeFilters.ageRange;
      if (patient.age === undefined || patient.age < min || patient.age > max) {
        return false;
      }
    }

    return true;
  });
}

function filterObservations(
  observations: ObservationAggregate[],
  activeFilters: Record<string, any>,
  patients?: PatientAggregate[]
): ObservationAggregate[] {
  // First get filtered patient IDs if patient filters are active
  let filteredPatientIds: Set<string> | null = null;
  if (patients && (activeFilters.gender || activeFilters.ageGroup || activeFilters.ageRange)) {
    const filteredPatients = filterPatients(patients, activeFilters);
    filteredPatientIds = new Set(filteredPatients.map(p => p.id));
  }

  return observations.filter(obs => {
    // Filter by patient if patient filters are active
    if (filteredPatientIds && obs.patientId) {
      if (!filteredPatientIds.has(obs.patientId)) {
        return false;
      }
    }

    // Category filter
    if (activeFilters.observationCategory && Array.isArray(activeFilters.observationCategory) && activeFilters.observationCategory.length > 0) {
      if (!obs.category || !activeFilters.observationCategory.includes(obs.category)) {
        return false;
      }
    }

    // Date range filter
    if (activeFilters.dateRange && Array.isArray(activeFilters.dateRange) && activeFilters.dateRange.length === 2) {
      if (!obs.date) return false;
      const obsDate = new Date(obs.date);
      const [startDate, endDate] = activeFilters.dateRange.map((d: string) => new Date(d));
      if (obsDate < startDate || obsDate > endDate) {
        return false;
      }
    }

    return true;
  });
}

function filterConditions(
  conditions: ConditionAggregate[],
  activeFilters: Record<string, any>,
  patients?: PatientAggregate[]
): ConditionAggregate[] {
  // First get filtered patient IDs if patient filters are active
  let filteredPatientIds: Set<string> | null = null;
  if (patients && (activeFilters.gender || activeFilters.ageGroup || activeFilters.ageRange)) {
    const filteredPatients = filterPatients(patients, activeFilters);
    filteredPatientIds = new Set(filteredPatients.map(p => p.id));
  }

  return conditions.filter(cond => {
    // Filter by patient if patient filters are active
    if (filteredPatientIds && cond.patientId) {
      if (!filteredPatientIds.has(cond.patientId)) {
        return false;
      }
    }

    // Condition category filter
    if (activeFilters.conditionCategory && Array.isArray(activeFilters.conditionCategory) && activeFilters.conditionCategory.length > 0) {
      if (!cond.category || !activeFilters.conditionCategory.includes(cond.category)) {
        return false;
      }
    }

    // Severity filter
    if (activeFilters.severity && Array.isArray(activeFilters.severity) && activeFilters.severity.length > 0) {
      if (!cond.severity || !activeFilters.severity.includes(cond.severity)) {
        return false;
      }
    }

    // Date range filter
    if (activeFilters.dateRange && Array.isArray(activeFilters.dateRange) && activeFilters.dateRange.length === 2) {
      if (!cond.onsetDate) return false;
      const condDate = new Date(cond.onsetDate);
      const [startDate, endDate] = activeFilters.dateRange.map((d: string) => new Date(d));
      if (condDate < startDate || condDate > endDate) {
        return false;
      }
    }

    return true;
  });
}

function calculateDemographics(patients: PatientAggregate[]) {
  const genderDist: Record<string, number> = {};
  const ageGroups: Record<string, number> = {
    '0-18': 0,
    '19-30': 0,
    '31-50': 0,
    '51-70': 0,
    '70+': 0
  };
  const ages: number[] = [];

  patients.forEach(patient => {
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

  return {
    totalPatients: patients.length,
    genderDistribution: genderDist,
    ageGroups,
    averageAge: avgAge ? Math.round(avgAge * 10) / 10 : undefined,
    medianAge
  };
}

/**
 * Recalculates all chart data based on filtered dataset
 * This transforms the filtered source data into chart-ready format for any chart type
 */
export function recalculateAllCharts(
  filteredData: SourceDataset,
  originalCharts: any[]
): any[] {
  if (!filteredData || !originalCharts) return originalCharts;

  return originalCharts.map(chart => {
    const chartId = chart.id || '';
    const chartTitle = chart.title?.toLowerCase() || '';

    // Gender distribution chart
    if (chartId.includes('gender') || chartTitle.includes('gender')) {
      if (filteredData.demographics?.genderDistribution) {
        return {
          ...chart,
          data: Object.entries(filteredData.demographics.genderDistribution).map(([name, value]) => ({
            name,
            value,
            percentage: filteredData.demographics?.totalPatients 
              ? Math.round((value / filteredData.demographics.totalPatients) * 100) 
              : 0
          }))
        };
      }
    }

    // Age distribution chart
    if (chartId.includes('age') || chartTitle.includes('age')) {
      if (filteredData.demographics?.ageGroups) {
        return {
          ...chart,
          data: Object.entries(filteredData.demographics.ageGroups).map(([name, value]) => ({
            name,
            value,
            percentage: filteredData.demographics?.totalPatients 
              ? Math.round((value / filteredData.demographics.totalPatients) * 100) 
              : 0
          }))
        };
      }
    }

    // Observation category chart
    if (chartId.includes('observation') || chartTitle.includes('observation') || chartTitle.includes('test')) {
      if (filteredData.observations) {
        const categoryCount: Record<string, number> = {};
        filteredData.observations.forEach(obs => {
          const category = obs.category || 'Unknown';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
        return {
          ...chart,
          data: Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
        };
      }
    }

    // Condition prevalence chart
    if (chartId.includes('condition') || chartTitle.includes('condition') || chartTitle.includes('diagnosis')) {
      if (filteredData.conditions) {
        const conditionCount: Record<string, number> = {};
        filteredData.conditions.forEach(cond => {
          const display = cond.display || cond.code || 'Unknown';
          conditionCount[display] = (conditionCount[display] || 0) + 1;
        });
        
        return {
          ...chart,
          data: Object.entries(conditionCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([name, value]) => ({ name, value }))
        };
      }
    }

    // Condition severity chart
    if (chartId.includes('severity') || chartTitle.includes('severity')) {
      if (filteredData.conditions) {
        const severityCount: Record<string, number> = {};
        filteredData.conditions.forEach(cond => {
          const severity = cond.severity || 'Unknown';
          severityCount[severity] = (severityCount[severity] || 0) + 1;
        });
        
        return {
          ...chart,
          data: Object.entries(severityCount).map(([name, value]) => ({ name, value }))
        };
      }
    }

    // Return original chart if no transformation applies
    return chart;
  });
}

/**
 * Recalculates all metrics based on filtered dataset
 */
export function recalculateAllMetrics(
  filteredData: SourceDataset,
  originalMetrics: any[]
): any[] {
  if (!filteredData || !originalMetrics) return originalMetrics;

  return originalMetrics.map(metric => {
    const metricLabel = metric.label?.toLowerCase() || '';

    // Patient count metrics
    if (metricLabel.includes('patient') || metricLabel.includes('cohort')) {
      return {
        ...metric,
        value: filteredData.metadata?.patientCount || 0
      };
    }

    // Observation count metrics
    if (metricLabel.includes('observation') || metricLabel.includes('test') || metricLabel.includes('measurement')) {
      return {
        ...metric,
        value: filteredData.metadata?.observationCount || 0
      };
    }

    // Condition count metrics
    if (metricLabel.includes('condition') || metricLabel.includes('diagnosis')) {
      return {
        ...metric,
        value: filteredData.metadata?.conditionCount || 0
      };
    }

    // Average age metric
    if (metricLabel.includes('average age') || metricLabel.includes('mean age')) {
      return {
        ...metric,
        value: filteredData.demographics?.averageAge 
          ? `${filteredData.demographics.averageAge} years` 
          : metric.value
      };
    }

    // Median age metric
    if (metricLabel.includes('median age')) {
      return {
        ...metric,
        value: filteredData.demographics?.medianAge 
          ? `${filteredData.demographics.medianAge} years` 
          : metric.value
      };
    }

    // Return original metric if no transformation applies
    return metric;
  });
}
