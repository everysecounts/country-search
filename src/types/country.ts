interface CountryLanguage {
  name: string;
}

interface CountryCurrency {
  code: string;
  name: string;
  symbol: string;
}

interface CountryFlags {
  png: string;
  svg: string;
}

interface CountryApiResponse {
  name: string;
  flag: string;
  flags?: CountryFlags;
  capital: string;
  region: string;
  subregion?: string;
  population: number;
  area?: number;
  currencies?: CountryCurrency[];
  languages: CountryLanguage[];
  borders?: string[];
}

interface CountryCard {
  name: string;
  flag: string;
  capital: string;
  region: string;
  subregion?: string;
  population: number;
  area?: number;
  currencies: CountryCurrency[];
  languages: string[];
  borders: string[];
}

export type { CountryApiResponse, CountryCard, CountryCurrency, CountryFlags, CountryLanguage };
