import { Dispatch, KeyboardEvent, RefObject, SetStateAction, useCallback, useRef, useState } from 'react';
import { useDebouncedValue } from './use-debounced-value';
import { useSearchFocusShortcut } from './use-search-focus-shortcut';

type UseGridSearchOptions = {
  initialQuery?: string;
  debounceMs?: number;
};

type UseGridSearchResult = {
  searchQuery: string;
  debouncedSearchQuery: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  clearSearchQuery: () => void;
  handleSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export function useGridSearch(options: UseGridSearchOptions = {}): UseGridSearchResult {
  const { initialQuery = '', debounceMs = 180 } = options;
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, debounceMs);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  useSearchFocusShortcut(searchInputRef);

  const clearSearchQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSearchInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Escape' || searchQuery.length === 0) return;
      event.preventDefault();
      setSearchQuery('');
    },
    [searchQuery],
  );

  return {
    searchQuery,
    debouncedSearchQuery,
    searchInputRef,
    setSearchQuery,
    clearSearchQuery,
    handleSearchInputKeyDown,
  };
}
