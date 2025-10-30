import axios from 'axios';
import type { FHIRPatient, FHIRObservation, FHIRCondition } from '@shared/schema';

const FHIR_BASE_URL = 'https://hapi.fhir.org/baseR4';

export class FHIRClient {
  private baseUrl: string;

  constructor(baseUrl: string = FHIR_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getPatients(limit: number = 20): Promise<FHIRPatient[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/Patient`, {
        params: { _count: limit },
        timeout: 10000,
      });

      const entries = response.data.entry || [];
      return entries.map((entry: any) => entry.resource);
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  }

  async getObservations(limit: number = 50): Promise<FHIRObservation[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/Observation`, {
        params: { _count: limit, _sort: '-date' },
        timeout: 10000,
      });

      const entries = response.data.entry || [];
      return entries.map((entry: any) => entry.resource);
    } catch (error) {
      console.error('Error fetching observations:', error);
      return [];
    }
  }

  async getConditions(limit: number = 50): Promise<FHIRCondition[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/Condition`, {
        params: { _count: limit },
        timeout: 10000,
      });

      const entries = response.data.entry || [];
      return entries.map((entry: any) => entry.resource);
    } catch (error) {
      console.error('Error fetching conditions:', error);
      return [];
    }
  }

  async searchResource(resourceType: string, params: Record<string, any> = {}): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${resourceType}`, {
        params: { _count: 50, ...params },
        timeout: 10000,
      });

      const entries = response.data.entry || [];
      return entries.map((entry: any) => entry.resource);
    } catch (error) {
      console.error(`Error searching ${resourceType}:`, error);
      return [];
    }
  }
}

export const fhirClient = new FHIRClient();
