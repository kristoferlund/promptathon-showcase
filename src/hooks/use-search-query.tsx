import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchQueryContext {
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;
  setDebouncedQuery: (query: string) => void;
}

const SearchQueryContext = createContext<SearchQueryContext | null>(null);

export function SearchQueryProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  return (
    <SearchQueryContext value={{ query, setQuery, debouncedQuery, setDebouncedQuery }}>
      {children}
    </SearchQueryContext>
  );
}

export default function useSearchQuery() {
  const context = useContext(SearchQueryContext);
  if (!context) {
    throw new Error("useSearchQuery must be used within a SearchQueryProvider");
  }
  return context;
}
