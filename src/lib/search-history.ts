const SEARCH_HISTORY_KEY = 'onlyamericanfans:search-history';
const SEARCH_HISTORY_LIMIT = 6;

export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) ?? '[]') as unknown;
    return Array.isArray(stored)
      ? stored.filter((value): value is string => typeof value === 'string').slice(0, SEARCH_HISTORY_LIMIT)
      : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history: string[]): string[] {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {}
  return history;
}

export function addSearchTerm(term: string): string[] {
  const clean = term.trim();
  if (!clean) return getSearchHistory();
  const next = [
    clean,
    ...getSearchHistory().filter((item) => item.toLowerCase() !== clean.toLowerCase()),
  ].slice(0, SEARCH_HISTORY_LIMIT);
  return saveSearchHistory(next);
}

export function removeSearchTerm(term: string): string[] {
  return saveSearchHistory(getSearchHistory().filter((item) => item !== term));
}

export function clearSearchHistory(): string[] {
  return saveSearchHistory([]);
}
