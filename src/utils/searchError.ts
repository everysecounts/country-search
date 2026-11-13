import type { SearchErrorType } from '@/types/searchError';

function getSearchErrorType(error: unknown): SearchErrorType {
  void error;

  throw new Error('Not implemented');
}

export { getSearchErrorType };
