interface CountryLanguage {
  name: string;
}

interface CountryApiResponse {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: CountryLanguage[];
}

interface CountryCard {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
}

export type { CountryApiResponse, CountryCard, CountryLanguage };
