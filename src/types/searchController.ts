import type { CountryCard } from '@/types/country';
import type { SearchErrorType } from '@/types/searchError';

type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface SearchState {
  status: SearchStatus;
  query: string;
  countries: CountryCard[];
  errorType?: SearchErrorType;
}

interface SearchControllerOptions {
  abortOnInput?: boolean;
}

interface SearchController {
  onQueryChange(query: string): void;
  retry(): void;
  destroy(): void;
}

export type { SearchController, SearchControllerOptions, SearchState, SearchStatus };
