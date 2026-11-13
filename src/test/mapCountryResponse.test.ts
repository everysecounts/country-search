import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '@/api/mapCountryResponse';
import type { CountryApiResponse } from '@/types/country';

describe('mapCountryResponse', () => {
  it('should map all fields required for a country card', () => {
    const raw: CountryApiResponse = {
      name: 'Germany',
      flag: '🇩🇪',
      capital: 'Berlin',
      region: 'Europe',
      population: 83240525,
      languages: [
        {
          name: 'German',
        },
      ],
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Germany',
      flag: '🇩🇪',
      capital: 'Berlin',
      region: 'Europe',
      population: 83240525,
      languages: ['German'],
    });
  });

  it('should map multiple languages to an array of names', () => {
    const raw: CountryApiResponse = {
      name: 'Switzerland',
      flag: '🇨🇭',
      capital: 'Bern',
      region: 'Europe',
      population: 8654622,
      languages: [{ name: 'German' }, { name: 'French' }, { name: 'Italian' }, { name: 'Romansh' }],
    };

    const result = mapCountryResponse(raw);

    expect(result.languages).toEqual(['German', 'French', 'Italian', 'Romansh']);
  });

  it('should not mutate the original API response', () => {
    const raw: CountryApiResponse = {
      name: 'Japan',
      flag: '🇯🇵',
      capital: 'Tokyo',
      region: 'Asia',
      population: 125836021,
      languages: [{ name: 'Japanese' }],
    };

    const original = structuredClone(raw);

    mapCountryResponse(raw);

    expect(raw).toEqual(original);
  });
});
