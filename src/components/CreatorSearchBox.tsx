'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addSearchTerm,
  clearSearchHistory,
  getSearchHistory,
  removeSearchTerm,
} from '@/lib/search-history';
import SearchHistoryDropdown from './SearchHistoryDropdown';

interface Props {
  defaultValue?: string;
  placeholder?: string;
}

export default function CreatorSearchBox({
  defaultValue = '',
  placeholder = 'Search by name, city or state…',
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHistory(getSearchHistory()));
    return () => cancelAnimationFrame(frame);
  }, []);

  const runSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setHistory(addSearchTerm(clean));
    setQuery(clean);
    setFocused(false);
    router.push(`/onlyfans-search?q=${encodeURIComponent(clean)}`);
  };

  return (
    <form
      action="/onlyfans-search"
      method="GET"
      className="search-mega-shell"
      onSubmit={(event) => {
        const clean = query.trim();
        if (!clean) {
          event.preventDefault();
          return;
        }
        setHistory(addSearchTerm(clean));
      }}
    >
      <div className="search-mega">
        <svg className="search-mega-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="search-mega-input"
          placeholder={placeholder}
          aria-label="Search creators"
          autoComplete="off"
        />
        <button type="submit" className="search-mega-btn">Search</button>
      </div>

      {focused && query.trim().length === 0 && (
        <SearchHistoryDropdown
          history={history}
          onSelect={runSearch}
          onRemove={(term) => setHistory(removeSearchTerm(term))}
          onClear={() => setHistory(clearSearchHistory())}
        />
      )}
    </form>
  );
}
