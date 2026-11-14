interface CacheEntry {
  data: unknown[];
  expiresAt: number;
}

interface InFlightRequest {
  controller: AbortController;
  promise: Promise<unknown[]>;
  subscribers: Set<symbol>;
}

export type { CacheEntry, InFlightRequest };
