import type { CountryApiResponse, CountryCard } from '@/types/country';

function mapCountryResponse(raw: CountryApiResponse): CountryCard {
  return {
    name: raw.name,
    flag: raw.flag,
    capital: raw.capital,
    region: raw.region,
    population: raw.population,
    languages: raw.languages.map(({ name }) => name),
  };
}

export { mapCountryResponse };
