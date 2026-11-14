import { searchCountriesWithCache } from '@/api/countrySearchService';
import { mapCountryResponse } from '@/api/mapCountryResponse';
import type { CountryApiResponse } from '@/types/country';
import type {
  SearchController,
  SearchControllerOptions,
  SearchState,
} from '@/types/searchController';
import { getSearchErrorType } from '@/utils/searchError';

const TIMEOUT_MS = 8000;

function createSearchController(
  onStateChange: (state: SearchState) => void,
  delay = 300,
  options: SearchControllerOptions = {},
): SearchController {
  const { abortOnInput = true } = options;

  let lastQuery = '';
  let requestId = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;

  const activeControllers = new Set<AbortController>();

  function updateState(
    status: SearchState['status'],
    query: string,
    countries: SearchState['countries'] = [],
    errorType?: SearchState['errorType'],
  ): void {
    if (destroyed) return;

    onStateChange({
      status,
      query,
      countries,
      ...(errorType ? { errorType } : {}),
    });
  }

  function clearDebounce(): void {
    if (debounceTimer === undefined) return;

    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }

  function abortRequests(): void {
    activeControllers.forEach((controller) => controller.abort());
    activeControllers.clear();
  }

  async function executeSearch(query: string, currentRequestId: number): Promise<void> {
    if (destroyed || currentRequestId !== requestId) return;

    const controller = new AbortController();
    activeControllers.add(controller);

    const timeoutId = setTimeout(() => {
      controller.abort(new DOMException('The operation timed out', 'TimeoutError'));
    }, TIMEOUT_MS);

    try {
      const rawCountries = await searchCountriesWithCache(query, controller.signal);

      if (destroyed || currentRequestId !== requestId) return;

      const countries = (rawCountries as CountryApiResponse[]).map(mapCountryResponse);

      updateState(countries.length > 0 ? 'success' : 'empty', query, countries);
    } catch (error: unknown) {
      if (destroyed || currentRequestId !== requestId) return;

      const errorType = getSearchErrorType(error);

      if (errorType === 'abort') return;

      updateState('error', query, [], errorType);
    } finally {
      clearTimeout(timeoutId);
      activeControllers.delete(controller);
    }
  }

  function onQueryChange(query: string): void {
    if (destroyed) return;

    lastQuery = query;
    requestId += 1;

    const currentRequestId = requestId;

    clearDebounce();

    if (abortOnInput) {
      abortRequests();
    }

    if (!query.trim()) {
      updateState('idle', query);
      return;
    }

    updateState('loading', query);

    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      void executeSearch(query.trim(), currentRequestId);
    }, delay);
  }

  function retry(): void {
    if (destroyed || !lastQuery.trim()) return;

    requestId += 1;

    const currentRequestId = requestId;
    const query = lastQuery.trim();

    clearDebounce();
    abortRequests();

    updateState('loading', lastQuery);

    void executeSearch(query, currentRequestId);
  }

  function destroy(): void {
    if (destroyed) return;

    destroyed = true;
    requestId += 1;

    clearDebounce();
    abortRequests();
  }

  return {
    onQueryChange,
    retry,
    destroy,
  };
}

export { createSearchController };
