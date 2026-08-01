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
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function HeaderCreatorSearch({ mobile = false, onNavigate }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
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
    setQuery('');
    setFocused(false);
    onNavigate?.();
    router.push(`/onlyfans-search?q=${encodeURIComponent(clean)}`);
  };

  return (
    <form
      action="/onlyfans-search"
      method="GET"
      className={`nav-creator-search nav-creator-search--${mobile ? 'mobile' : 'desktop'}`}
      onSubmit={(event) => {
        event.preventDefault();
        runSearch(query);
      }}
    >
      <button type="submit" className="nav-creator-search-submit" aria-label="Search creators">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
      <input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search creators..."
        aria-label="Search creators"
        autoComplete="off"
      />

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
