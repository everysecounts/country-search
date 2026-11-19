import type { CountryApiResponse } from '@/types/country';
import { searchCountries } from '@/api/searchCountries';
import type { CacheEntry, InFlightRequest } from '@/types/countrySearchService';

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, InFlightRequest>();

function getCacheKey(query: string): string {
  return query.trim().toLowerCase();
}

function getAbortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The operation was aborted', 'AbortError');
}

function getCachedResult(key: string): CountryApiResponse[] | undefined {
  const entry = cache.get(key);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  cache.delete(key);
  cache.set(key, entry);

  return entry.data;
}

function setCachedResult(key: string, data: CountryApiResponse[]): void {
  cache.delete(key);

  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  });

  if (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;

    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }
}

function createInFlightRequest(key: string, query: string): InFlightRequest {
  const controller = new AbortController();

  const request: InFlightRequest = {
    controller,
    promise: searchCountries(query, controller.signal),
    subscribers: new Set(),
  };

  inFlight.set(key, request);

  void request.promise.then(
    (data) => {
      if (inFlight.get(key) !== request) {
        return;
      }

      inFlight.delete(key);
      setCachedResult(key, data);
    },
    () => {
      if (inFlight.get(key) === request) {
        inFlight.delete(key);
      }
    },
  );

  return request;
}

function subscribeToRequest(
  key: string,
  request: InFlightRequest,
  signal: AbortSignal,
): Promise<CountryApiResponse[]> {
  return new Promise((resolve, reject) => {
    const subscriber = Symbol(key);
    let settled = false;

    request.subscribers.add(subscriber);

    function cleanup(): void {
      signal.removeEventListener('abort', handleAbort);
      request.subscribers.delete(subscriber);
    }

    function handleAbort(): void {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();

      reject(getAbortReason(signal));

      if (request.subscribers.size === 0 && inFlight.get(key) === request) {
        inFlight.delete(key);
        request.controller.abort(signal.reason);
      }
    }

    signal.addEventListener('abort', handleAbort, { once: true });

    request.promise.then(
      (data) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        resolve(data);
      },
      (error: unknown) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        reject(error);
      },
    );

    if (signal.aborted) {
      handleAbort();
    }
  });
}

function searchCountriesWithCache(
  query: string,
  signal: AbortSignal,
): Promise<CountryApiResponse[]> {
  const normalizedQuery = query.trim();

  if (signal.aborted) {
    return Promise.reject(getAbortReason(signal));
  }

  if (!normalizedQuery) {
    return Promise.resolve([]);
  }

  const key = getCacheKey(normalizedQuery);
  const cachedResult = getCachedResult(key);

  if (cachedResult !== undefined) {
    return Promise.resolve(cachedResult);
  }

  let request = inFlight.get(key);

  if (!request) {
    request = createInFlightRequest(key, normalizedQuery);
  }

  return subscribeToRequest(key, request, signal);
}

export { searchCountriesWithCache };
