import { describe, expect, it } from 'vitest';
import { HttpError } from '@/api/HttpError';
import { getSearchErrorType } from '@/utils/searchError';

describe('getSearchErrorType', () => {
  it('should identify AbortError as a user cancellation', () => {
    const error = new DOMException('The operation was aborted', 'AbortError');

    expect(getSearchErrorType(error)).toBe('abort');
  });

  it('should identify TimeoutError as a timeout', () => {
    const error = new DOMException('The operation timed out', 'TimeoutError');

    expect(getSearchErrorType(error)).toBe('timeout');
  });

  it('should identify HttpError as an HTTP error', () => {
    const error = new HttpError(500);

    expect(getSearchErrorType(error)).toBe('http');
  });

  it('should identify other errors as network errors', () => {
    const error = new TypeError('Failed to fetch');

    expect(getSearchErrorType(error)).toBe('network');
  });

  it('should identify unknown thrown values as network errors', () => {
    expect(getSearchErrorType('Unexpected error')).toBe('network');
    expect(getSearchErrorType(null)).toBe('network');
  });
});
