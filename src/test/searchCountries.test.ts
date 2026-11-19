import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCountries } from '@/api/searchCountries';

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should send a GET request to the correct URL', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await searchCountries('Germany', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/Germany',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('should encode the search query in the URL', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await searchCountries('United States & Canada', controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/United%20States%20%26%20Canada',
      expect.any(Object),
    );
  });

  it('should return parsed JSON on successful response', async () => {
    const countries = [
      {
        name: 'Germany',
        capital: 'Berlin',
      },
    ];

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(countries), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('Germany', controller.signal);

    expect(result).toEqual(countries);
  });

  it('should pass an AbortSignal to fetch', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await searchCountries('Germany', controller.signal);

    const requestOptions = fetchMock.mock.calls[0][1];

    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal);
  });
});
