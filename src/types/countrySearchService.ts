import type { CountryApiResponse } from '@/types/country';

interface CacheEntry {
  data: CountryApiResponse[];
  expiresAt: number;
}

interface InFlightRequest {
  controller: AbortController;
  promise: Promise<CountryApiResponse[]>;
  subscribers: Set<symbol>;
}

export type { CacheEntry, InFlightRequest };
