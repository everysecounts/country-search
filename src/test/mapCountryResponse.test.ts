import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '@/api/mapCountryResponse';
import type { CountryApiResponse } from '@/types/country';

describe('mapCountryResponse', () => {
  it('should map all country fields', () => {
    const raw: CountryApiResponse = {
      name: 'United States of America',
      flag: '🇺🇸',
      flags: {
        png: 'https://flagcdn.com/w320/us.png',
        svg: 'https://flagcdn.com/us.svg',
      },
      capital: 'Washington, D.C.',
      region: 'Americas',
      subregion: 'Northern America',
      population: 329484123,
      area: 9629091,
      borders: ['CAN', 'MEX'],
      languages: [{ name: 'English' }],
      currencies: [
        {
          code: 'USD',
          name: 'United States dollar',
          symbol: '$',
        },
      ],
    };

    expect(mapCountryResponse(raw)).toEqual({
      name: 'United States of America',
      flag: 'https://flagcdn.com/us.svg',
      capital: 'Washington, D.C.',
      region: 'Americas',
      subregion: 'Northern America',
      population: 329484123,
      area: 9629091,
      borders: ['CAN', 'MEX'],
      languages: ['English'],
      currencies: [
        {
          code: 'USD',
          name: 'United States dollar',
          symbol: '$',
        },
      ],
    });
  });

  it('should map multiple languages', () => {
    const raw: CountryApiResponse = {
      name: 'Switzerland',
      flag: '🇨🇭',
      capital: 'Bern',
      region: 'Europe',
      population: 8654622,
      languages: [{ name: 'German' }, { name: 'French' }, { name: 'Italian' }, { name: 'Romansh' }],
    };

    expect(mapCountryResponse(raw).languages).toEqual(['German', 'French', 'Italian', 'Romansh']);
  });

  it('should use emoji when flags are missing', () => {
    const raw: CountryApiResponse = {
      name: 'Germany',
      flag: '🇩🇪',
      capital: 'Berlin',
      region: 'Europe',
      population: 83240525,
      languages: [{ name: 'German' }],
    };

    expect(mapCountryResponse(raw).flag).toBe('🇩🇪');
  });

  it('should use empty arrays when optional collections are missing', () => {
    const raw: CountryApiResponse = {
      name: 'Japan',
      flag: '🇯🇵',
      capital: 'Tokyo',
      region: 'Asia',
      population: 125836021,
      languages: [{ name: 'Japanese' }],
    };

    const result = mapCountryResponse(raw);

    expect(result.currencies).toEqual([]);
    expect(result.borders).toEqual([]);
  });

  it('should not mutate the original API response', () => {
    const raw: CountryApiResponse = {
      name: 'Japan',
      flag: '🇯🇵',
      capital: 'Tokyo',
      region: 'Asia',
      population: 125836021,
      languages: [{ name: 'Japanese' }],
      currencies: [{ code: 'JPY', name: 'Japanese yen', symbol: '¥' }],
      borders: [],
    };

    const original = structuredClone(raw);

    mapCountryResponse(raw);

    expect(raw).toEqual(original);
  });
});
