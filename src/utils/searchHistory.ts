const STORAGE_KEY = 'country-search-history';
const MAX_HISTORY_ITEMS = 12;

function getSearchHistory(): string[] {
  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY);

    if (!storedHistory) return [];

    const parsedHistory: unknown = JSON.parse(storedHistory);

    if (!Array.isArray(parsedHistory)) return [];

    return parsedHistory
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

function addSearchHistory(query: string): string[] {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return getSearchHistory();
  }

  const history = getSearchHistory();

  const updatedHistory = [
    normalizedQuery,
    ...history.filter((item) => item.toLowerCase() !== normalizedQuery.toLowerCase()),
  ].slice(0, MAX_HISTORY_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

  return updatedHistory;
}

function removeSearchHistory(query: string): string[] {
  const updatedHistory = getSearchHistory().filter(
    (item) => item.toLowerCase() !== query.toLowerCase(),
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

  return updatedHistory;
}

function clearSearchHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export { addSearchHistory, clearSearchHistory, getSearchHistory, removeSearchHistory };
