import axios from 'axios';
import type { FHIRPatient, FHIRObservation, FHIRCondition } from '@shared/schema';
import { storage } from './storage';

const FHIR_BASE_URL = 'https://hapi.fhir.org/baseR4';
const CACHE_TTL_MINUTES = 10; // Cache FHIR data for 10 minutes

export class FHIRClient {
  private baseUrl: string;

  constructor(baseUrl: string = FHIR_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getCached<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = await storage.getCachedFHIRData(cacheKey);
    if (cached !== null) {
      console.log(`Cache hit for: ${cacheKey}`);
      return cached as T;
    }

    // Cache miss - fetch from FHIR server
    console.log(`Cache miss for: ${cacheKey} - fetching from FHIR server`);
    const data = await fetchFn();
    
    // Store in cache
    await storage.setCachedFHIRData(cacheKey, data, CACHE_TTL_MINUTES);
    
    return data;
  }

  async getPatients(limit: number = 20): Promise<FHIRPatient[]> {
    const cacheKey = `patients:${limit}`;
    
    return this.getCached(cacheKey, async () => {
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
    });
  }

  async getObservations(limit: number = 50): Promise<FHIRObservation[]> {
    const cacheKey = `observations:${limit}`;
    
    return this.getCached(cacheKey, async () => {
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
    });
  }

  async getConditions(limit: number = 50): Promise<FHIRCondition[]> {
    const cacheKey = `conditions:${limit}`;
    
    return this.getCached(cacheKey, async () => {
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
    });
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
