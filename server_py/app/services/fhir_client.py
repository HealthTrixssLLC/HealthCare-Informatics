"""FHIR client for fetching data from FHIR servers with caching and pagination."""
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from datetime import datetime

from app.config import settings
from app.services.storage import storage


class FHIRClient:
    """Client for interacting with FHIR servers."""
    
    def __init__(self, base_url: str = None):
        self.base_url = base_url or settings.FHIR_BASE_URL
        self.default_patient_limit = settings.DEFAULT_PATIENT_LIMIT
        self.default_observation_limit = settings.DEFAULT_OBSERVATION_LIMIT
        self.default_condition_limit = settings.DEFAULT_CONDITION_LIMIT
        self.max_patients = settings.MAX_PATIENTS
        self.max_observations = settings.MAX_OBSERVATIONS
        self.max_conditions = settings.MAX_CONDITIONS
        self.page_size = settings.PAGE_SIZE
        self.timeout = settings.REQUEST_TIMEOUT
    
    async def _fetch_paginated(
        self,
        resource_type: str,
        params: Dict[str, Any],
        max_records: int
    ) -> List[Dict[str, Any]]:
        """Fetch paginated results from FHIR server."""
        results = []
        next_url = f"{self.base_url}/{resource_type}"
        fetched_count = 0
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while next_url and fetched_count < max_records:
                try:
                    # Add pagination params on first request only
                    request_params = {**params, "_count": self.page_size} if next_url == f"{self.base_url}/{resource_type}" else {}
                    
                    response = await client.get(next_url, params=request_params)
                    response.raise_for_status()
                    data = response.json()
                    
                    entries = data.get("entry", [])
                    resources = [entry["resource"] for entry in entries]
                    
                    results.extend(resources)
                    fetched_count += len(resources)
                    
                    # Find next page link
                    links = data.get("link", [])
                    next_link = next((link for link in links if link.get("relation") == "next"), None)
                    next_url = next_link["url"] if next_link else None
                    
                    # Stop if no more results
                    if not resources:
                        break
                    
                except Exception as e:
                    print(f"Error fetching paginated {resource_type}: {e}")
                    break
        
        print(f"Fetched {len(results)} {resource_type} records (requested max: {max_records})")
        return results[:max_records]
    
    async def _get_cached(self, cache_key: str, fetch_fn):
        """Get data from cache or fetch if not cached."""
        cached = await storage.get_cached_fhir_data(cache_key)
        if cached is not None:
            print(f"Cache hit for: {cache_key}")
            return cached
        
        print(f"Cache miss for: {cache_key} - fetching from FHIR server")
        data = await fetch_fn()
        await storage.set_cached_fhir_data(cache_key, data, settings.CACHE_TTL_MINUTES)
        return data
    
    async def get_patients(self, limit: int = None) -> List[Dict[str, Any]]:
        """Fetch patient resources."""
        effective_limit = min(limit or self.default_patient_limit, self.max_patients)
        cache_key = f"patients:{effective_limit}"
        
        return await self._get_cached(
            cache_key,
            lambda: self._fetch_paginated("Patient", {}, effective_limit)
        )
    
    async def get_observations(self, limit: int = None) -> List[Dict[str, Any]]:
        """Fetch observation resources."""
        effective_limit = min(limit or self.default_observation_limit, self.max_observations)
        cache_key = f"observations:{effective_limit}"
        
        return await self._get_cached(
            cache_key,
            lambda: self._fetch_paginated("Observation", {"_sort": "-date"}, effective_limit)
        )
    
    async def get_conditions(self, limit: int = None) -> List[Dict[str, Any]]:
        """Fetch condition resources."""
        effective_limit = min(limit or self.default_condition_limit, self.max_conditions)
        cache_key = f"conditions:{effective_limit}"
        
        return await self._get_cached(
            cache_key,
            lambda: self._fetch_paginated("Condition", {}, effective_limit)
        )
    
    async def search_resource(
        self,
        resource_type: str,
        params: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Search for FHIR resources."""
        params = params or {}
        params["_count"] = 50
        
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/{resource_type}",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                entries = data.get("entry", [])
                return [entry["resource"] for entry in entries]
            except Exception as e:
                print(f"Error searching {resource_type}: {e}")
                return []


# Global FHIR client instance
fhir_client = FHIRClient()
