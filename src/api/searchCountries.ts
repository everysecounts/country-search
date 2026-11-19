import { HttpError } from '@/api/HttpError';
import type { CountryApiResponse } from '@/types/country';

async function searchCountries(query: string, signal: AbortSignal): Promise<CountryApiResponse[]> {
  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    method: 'GET',
    signal,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return (await response.json()) as CountryApiResponse[];
}

export { searchCountries };
