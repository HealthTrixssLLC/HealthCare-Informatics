import axios from 'axios';
import type { FHIRPatient, FHIRObservation, FHIRCondition } from '@shared/schema';
import { storage } from './storage';

const FHIR_BASE_URL = 'https://hapi.fhir.org/baseR4';
const CACHE_TTL_MINUTES = 10; // Cache FHIR data for 10 minutes

// Configuration for fetching FHIR data
const FHIR_CONFIG = {
  DEFAULT_PATIENT_LIMIT: 500,        // Fetch 500 patients by default
  DEFAULT_OBSERVATION_LIMIT: 1000,   // Fetch 1000 observations
  DEFAULT_CONDITION_LIMIT: 1000,     // Fetch 1000 conditions
  MAX_PATIENTS: 1000,                // Maximum patients to fetch
  MAX_OBSERVATIONS: 2000,            // Maximum observations to fetch
  MAX_CONDITIONS: 2000,              // Maximum conditions to fetch
  PAGE_SIZE: 100,                    // Fetch 100 records per page for pagination
  REQUEST_TIMEOUT: 15000,            // 15 second timeout per request
};

export class FHIRClient {
  private baseUrl: string;

  constructor(baseUrl: string = FHIR_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch paginated results from FHIR server
   * Automatically follows pagination links to get all available data up to maxRecords
   */
  private async fetchPaginated<T>(
    resourceType: string,
    params: Record<string, any>,
    maxRecords: number
  ): Promise<T[]> {
    const results: T[] = [];
    let nextUrl: string | null = `${this.baseUrl}/${resourceType}`;
    let fetchedCount = 0;

    try {
      while (nextUrl && fetchedCount < maxRecords) {
        const response: any = await axios.get(nextUrl, {
          params: nextUrl === `${this.baseUrl}/${resourceType}` ? { ...params, _count: FHIR_CONFIG.PAGE_SIZE } : undefined,
          timeout: FHIR_CONFIG.REQUEST_TIMEOUT,
        });

        const entries: any[] = response.data.entry || [];
        const resources = entries.map((entry: any) => entry.resource as T);
        
        results.push(...resources);
        fetchedCount += resources.length;

        // Check for next page link
        const links: any[] = response.data.link || [];
        const nextLink: any = links.find((link: any) => link.relation === 'next');
        nextUrl = nextLink?.url || null;

        // Stop if we've reached the limit
        if (fetchedCount >= maxRecords) {
          break;
        }

        // Also stop if no more results on this page
        if (resources.length === 0) {
          break;
        }
      }

      console.log(`Fetched ${results.length} ${resourceType} records (requested max: ${maxRecords})`);
      return results.slice(0, maxRecords); // Ensure we don't exceed max
    } catch (error) {
      console.error(`Error fetching paginated ${resourceType}:`, error);
      return results; // Return what we have so far
    }
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

  async getPatients(limit: number = FHIR_CONFIG.DEFAULT_PATIENT_LIMIT): Promise<FHIRPatient[]> {
    const effectiveLimit = Math.min(limit, FHIR_CONFIG.MAX_PATIENTS);
    const cacheKey = `patients:${effectiveLimit}`;
    
    return this.getCached(cacheKey, async () => {
      return this.fetchPaginated<FHIRPatient>('Patient', {}, effectiveLimit);
    });
  }

  async getObservations(limit: number = FHIR_CONFIG.DEFAULT_OBSERVATION_LIMIT): Promise<FHIRObservation[]> {
    const effectiveLimit = Math.min(limit, FHIR_CONFIG.MAX_OBSERVATIONS);
    const cacheKey = `observations:${effectiveLimit}`;
    
    return this.getCached(cacheKey, async () => {
      return this.fetchPaginated<FHIRObservation>('Observation', { _sort: '-date' }, effectiveLimit);
    });
  }

  async getConditions(limit: number = FHIR_CONFIG.DEFAULT_CONDITION_LIMIT): Promise<FHIRCondition[]> {
    const effectiveLimit = Math.min(limit, FHIR_CONFIG.MAX_CONDITIONS);
    const cacheKey = `conditions:${effectiveLimit}`;
    
    return this.getCached(cacheKey, async () => {
      return this.fetchPaginated<FHIRCondition>('Condition', {}, effectiveLimit);
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
