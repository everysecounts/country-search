import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCountries } from '@/api/searchCountries';

describe('searchCountries HTTP errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return an empty array when response status is 404', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Not Found' }), {
        status: 404,
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    const result = await searchCountries('UnknownCountry', controller.signal);

    expect(result).toEqual([]);
  });

  it.each([400, 500, 503])('should throw HttpError when response status is %i', async (status) => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Request failed' }), {
        status,
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();

    await expect(searchCountries('Germany', controller.signal)).rejects.toMatchObject({
      name: 'HttpError',
      status,
    });
  });
});
