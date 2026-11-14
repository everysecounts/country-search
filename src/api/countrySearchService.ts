import { searchCountries } from '@/api/searchCountries';

function searchCountriesWithCache(query: string, signal: AbortSignal): Promise<unknown[]> {
  return searchCountries(query, signal);
}

export { searchCountriesWithCache };
