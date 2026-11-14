import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '@/utils/searchController';
import type { SearchState } from '@/types/searchController';

interface PendingFetch {
  url: string;
  signal: AbortSignal;
  promise: Promise<Response>;
  resolve: (response: Response) => void;
}

function createCountryResponse(
  name: string,
  flag: string,
  capital: string,
  region: string,
  population: number,
  language: string,
): Response {
  return new Response(
    JSON.stringify([
      {
        name,
        flag,
        capital,
        region,
        population,
        languages: [{ name: language }],
      },
    ]),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

function installFetchMock(): {
  requests: PendingFetch[];
  abortErrors: DOMException[];
} {
  const requests: PendingFetch[] = [];
  const abortErrors: DOMException[] = [];

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const signal = init?.signal;

    if (!signal) {
      return Promise.reject(new TypeError('Missing abort signal'));
    }

    let settled = false;
    let resolvePromise!: (response: Response) => void;
    let rejectPromise!: (reason?: unknown) => void;

    const promise = new Promise<Response>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const rejectOnce = (reason: unknown): void => {
      if (settled) return;

      settled = true;
      rejectPromise(reason);
    };

    const request: PendingFetch = {
      url: String(input),
      signal,
      promise,
      resolve: (response) => {
        if (settled) return;

        if (signal.aborted) {
          const error =
            signal.reason instanceof DOMException
              ? signal.reason
              : new DOMException('The operation was aborted', 'AbortError');

          abortErrors.push(error);
          rejectOnce(error);
          return;
        }

        settled = true;
        resolvePromise(response);
      },
    };

    const rejectOnAbort = (): void => {
      if (settled) return;

      const error =
        signal.reason instanceof DOMException
          ? signal.reason
          : new DOMException('The operation was aborted', 'AbortError');

      abortErrors.push(error);
      rejectOnce(error);
    };

    requests.push(request);

    if (signal.aborted) {
      rejectOnAbort();
      return promise;
    }

    signal.addEventListener('abort', rejectOnAbort, { once: true });

    return promise;
  });

  vi.stubGlobal('fetch', fetchMock);

  return { requests, abortErrors };
}

function nextQuery(label: string): string {
  return `${label}-${Math.random().toString(16).slice(2)}`;
}

function countryUrl(query: string): string {
  return `https://countries.dev/name/${encodeURIComponent(query)}`;
}

describe('search controller request race', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('rejects with AbortError when the signal is aborted before the fetch promise resolves', async () => {
    vi.useFakeTimers();

    const { requests, abortErrors } = installFetchMock();
    const states: SearchState[] = [];
    const earlyQuery = nextQuery('sp');
    const laterQuery = nextQuery('spain');

    const controller = createSearchController((state) => states.push(state), 300);

    controller.onQueryChange(earlyQuery);
    await vi.advanceTimersByTimeAsync(300);

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(countryUrl(earlyQuery));
    expect(requests[0].signal.aborted).toBe(false);

    const earlyRejection = expect(requests[0].promise).rejects.toMatchObject({
      name: 'AbortError',
    });

    controller.onQueryChange(laterQuery);

    expect(requests[0].signal.aborted).toBe(true);

    await earlyRejection;

    expect(abortErrors).toHaveLength(1);
    expect(abortErrors[0].name).toBe('AbortError');
    expect(states.some((state) => state.status === 'error')).toBe(false);

    await vi.advanceTimersByTimeAsync(300);

    expect(requests).toHaveLength(2);
    expect(requests[1].url).toBe(countryUrl(laterQuery));
    expect(requests[1].signal.aborted).toBe(false);

    requests[1].resolve(
      createCountryResponse('Spain', '🇪🇸', 'Madrid', 'Europe', 48000000, 'Spanish'),
    );

    await vi.waitFor(() => {
      expect(states.at(-1)?.status).toBe('success');
      expect(states.at(-1)?.countries[0].name).toBe('Spain');
    });

    expect(states.at(-1)?.query).toBe(laterQuery);
    expect(states.some((state) => state.status === 'error')).toBe(false);

    controller.destroy();
  });

  it('resolves the earlier fetch promise after the later one and keeps only the latest result', async () => {
    vi.useFakeTimers();

    const { requests } = installFetchMock();
    const states: SearchState[] = [];
    const earlyQuery = nextQuery('ge');
    const laterQuery = nextQuery('georgia');

    const controller = createSearchController((state) => states.push(state), 300, {
      abortOnInput: false,
    });

    controller.onQueryChange(earlyQuery);
    await vi.advanceTimersByTimeAsync(300);

    expect(requests).toHaveLength(1);

    controller.onQueryChange(laterQuery);
    await vi.advanceTimersByTimeAsync(300);

    expect(requests).toHaveLength(2);
    expect(requests[0].url).toBe(countryUrl(earlyQuery));
    expect(requests[1].url).toBe(countryUrl(laterQuery));
    expect(requests[0].signal.aborted).toBe(false);
    expect(requests[1].signal.aborted).toBe(false);

    const earlyFetch = requests[0].promise;
    const laterFetch = requests[1].promise;

    requests[1].resolve(
      createCountryResponse('Spain', '🇪🇸', 'Madrid', 'Europe', 48000000, 'Spanish'),
    );

    await expect(laterFetch).resolves.toBeInstanceOf(Response);

    await vi.waitFor(() => {
      expect(states.at(-1)?.status).toBe('success');
      expect(states.at(-1)?.countries[0].name).toBe('Spain');
    });

    const stateCountAfterLaterResponse = states.length;

    requests[0].resolve(
      createCountryResponse('Georgia', '🇬🇪', 'Tbilisi', 'Asia', 3700000, 'Georgian'),
    );

    await expect(earlyFetch).resolves.toBeInstanceOf(Response);

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(states).toHaveLength(stateCountAfterLaterResponse);
    expect(states.at(-1)?.query).toBe(laterQuery);
    expect(states.at(-1)?.status).toBe('success');
    expect(states.at(-1)?.countries.map(({ name }) => name)).toEqual(['Spain']);

    expect(states.some((state) => state.countries.some(({ name }) => name === 'Georgia'))).toBe(
      false,
    );

    expect(states.some((state) => state.status === 'error')).toBe(false);

    controller.destroy();
  });
});
