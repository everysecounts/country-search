import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createResponse(status = 200): Response {
  return new Response('[]', {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

type SearchService = typeof import('@/api/countrySearchService');

let service: SearchService;

beforeEach(async () => {
  vi.resetModules();
  service = await import('@/api/countrySearchService');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('country search cache', () => {
  it('returns a cached result for a repeated normalized query', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => createResponse());
    vi.stubGlobal('fetch', fetchMock);

    const firstResult = await service.searchCountriesWithCache(
      'France',
      new AbortController().signal,
    );
    const secondResult = await service.searchCountriesWithCache(
      '  france  ',
      new AbortController().signal,
    );
    const thirdResult = await service.searchCountriesWithCache(
      'FRANCE',
      new AbortController().signal,
    );

    expect(firstResult).toEqual([]);
    expect(secondResult).toEqual(firstResult);
    expect(thirdResult).toEqual(firstResult);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requests the data again after the five-minute TTL expires', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => createResponse());
    vi.stubGlobal('fetch', fetchMock);

    await service.searchCountriesWithCache('Iceland', new AbortController().signal);

    await service.searchCountriesWithCache('Iceland', new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);

    await service.searchCountriesWithCache('Iceland', new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('evicts the least recently used entry when the cache exceeds 50 entries', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => createResponse());
    vi.stubGlobal('fetch', fetchMock);

    for (let index = 0; index < 50; index += 1) {
      await service.searchCountriesWithCache(`country-${index}`, new AbortController().signal);
    }

    await service.searchCountriesWithCache('country-0', new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledTimes(50);

    await service.searchCountriesWithCache('country-50', new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledTimes(51);

    await service.searchCountriesWithCache('country-0', new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledTimes(51);

    await service.searchCountriesWithCache('country-1', new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledTimes(52);
  });

  it('deduplicates rejected requests and allows retry', async () => {
    const deferred = createDeferred<Response>();
    const fetchMock = vi.fn<typeof fetch>().mockReturnValue(deferred.promise);
    vi.stubGlobal('fetch', fetchMock);

    const firstRequest = service.searchCountriesWithCache('Japan', new AbortController().signal);
    const secondRequest = service.searchCountriesWithCache('Japan', new AbortController().signal);

    const firstRejection = expect(firstRequest).rejects.toThrow('Network error');
    const secondRejection = expect(secondRequest).rejects.toThrow('Network error');

    const initialFetchCount = fetchMock.mock.calls.length;

    deferred.reject(new TypeError('Network error'));

    await Promise.all([firstRejection, secondRejection]);

    fetchMock.mockResolvedValue(createResponse());

    await expect(
      service.searchCountriesWithCache('Japan', new AbortController().signal),
    ).resolves.toEqual([]);

    expect(initialFetchCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('in-flight request deduplication', () => {
  it('shares one fetch for simultaneous requests with the same normalized query', async () => {
    const deferred = createDeferred<Response>();
    const fetchMock = vi.fn<typeof fetch>().mockReturnValue(deferred.promise);
    vi.stubGlobal('fetch', fetchMock);

    const firstRequest = service.searchCountriesWithCache('Sweden', new AbortController().signal);
    const secondRequest = service.searchCountriesWithCache(
      ' sweden ',
      new AbortController().signal,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    deferred.resolve(createResponse());

    await expect(firstRequest).resolves.toEqual([]);
    await expect(secondRequest).resolves.toEqual([]);
  });

  it('does not abort the shared fetch when one of multiple subscribers cancels', async () => {
    const requests: Array<{
      signal: AbortSignal;
      deferred: ReturnType<typeof createDeferred<Response>>;
    }> = [];

    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_input, init) => {
      const deferred = createDeferred<Response>();
      const signal = init?.signal as AbortSignal;

      requests.push({ signal, deferred });

      signal.addEventListener('abort', () => deferred.reject(signal.reason), { once: true });

      return deferred.promise;
    });

    vi.stubGlobal('fetch', fetchMock);

    const firstController = new AbortController();
    const secondController = new AbortController();

    const firstRequest = service.searchCountriesWithCache('Norway', firstController.signal);
    const secondRequest = service.searchCountriesWithCache('Norway', secondController.signal);

    const firstRejection = expect(firstRequest).rejects.toMatchObject({
      name: 'AbortError',
    });
    const secondResolution = expect(secondRequest).resolves.toEqual([]);

    firstController.abort(new DOMException('Cancelled', 'AbortError'));

    await firstRejection;

    const sharedSignalAborted = requests[0].signal.aborted;
    const fetchCallCount = fetchMock.mock.calls.length;

    requests.forEach(({ deferred }) => deferred.resolve(createResponse()));

    await secondResolution;

    expect(sharedSignalAborted).toBe(false);
    expect(fetchCallCount).toBe(1);
  });

  it('aborts the shared fetch only when the last subscriber cancels', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_input, init) => {
      const signal = init?.signal as AbortSignal;

      return new Promise<Response>((_resolve, reject) => {
        if (signal.aborted) {
          reject(signal.reason);
          return;
        }

        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const firstController = new AbortController();
    const secondController = new AbortController();

    const firstRequest = service.searchCountriesWithCache('Belgium', firstController.signal);
    const secondRequest = service.searchCountriesWithCache('Belgium', secondController.signal);

    const firstRejection = expect(firstRequest).rejects.toMatchObject({
      name: 'AbortError',
    });
    const secondRejection = expect(secondRequest).rejects.toMatchObject({
      name: 'AbortError',
    });

    const sharedSignal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;

    firstController.abort(new DOMException('Cancelled', 'AbortError'));

    await firstRejection;

    const abortedAfterFirstCancellation = sharedSignal.aborted;
    const fetchCountAfterFirstCancellation = fetchMock.mock.calls.length;

    secondController.abort(new DOMException('Cancelled', 'AbortError'));

    await secondRejection;

    expect(abortedAfterFirstCancellation).toBe(false);
    expect(fetchCountAfterFirstCancellation).toBe(1);
    expect(sharedSignal.aborted).toBe(true);
  });
});
