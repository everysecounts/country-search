async function searchCountries(query: string, signal: AbortSignal): Promise<unknown[]> {
  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    method: 'GET',
    signal,
  });

  return (await response.json()) as unknown[];
}

export { searchCountries };
