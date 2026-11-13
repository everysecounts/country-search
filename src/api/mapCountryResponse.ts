import type { CountryApiResponse, CountryCard } from '@/types/country';

function mapCountryResponse(raw: CountryApiResponse): CountryCard {
  void raw;

  throw new Error('Not implemented');
}

export { mapCountryResponse };
