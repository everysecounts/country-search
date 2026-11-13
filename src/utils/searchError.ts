import { HttpError } from '@/api/HttpError';
import type { SearchErrorType } from '@/types/searchError';

function getSearchErrorType(error: unknown): SearchErrorType {
  if (error instanceof HttpError) {
    return 'http';
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    if (error.name === 'AbortError') {
      return 'abort';
    }

    if (error.name === 'TimeoutError') {
      return 'timeout';
    }
  }

  return 'network';
}

export { getSearchErrorType };
