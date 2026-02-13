import { createFileRoute } from "@tanstack/react-router";
import { useDebouncer } from "@tanstack/react-pacer";
import useListApps from "@/hooks/use-list-apps";
import useSearch from "@/hooks/use-search";
import useSearchQuery from "@/hooks/use-search-query";
import { Search } from "lucide-react";
import SearchResults from "@/components/search-results";
import AppGallery from "@/components/app-gallery";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { query, setQuery, debouncedQuery, setDebouncedQuery } = useSearchQuery();
  const { data: apps, isLoading: appsLoading } = useListApps();
  const { data: searchResults, isLoading: searchLoading } = useSearch(
    debouncedQuery,
  );

  const debouncer = useDebouncer(
    (value: string) => { setDebouncedQuery(value.trim()); },
    { wait: 500 },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncer.maybeExecute(value);
  };

  const isSearching = debouncedQuery.length >= 3;

  return (
    <div className="min-h-screen flex flex-col items-center gap-10">

      <img src="/public/promptathon-logo.png" className="pt-8 w-100" />


      {/* Search */}
      <div className="w-full max-w-160 px-4">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search apps..."
            autoComplete="off"
            className="w-full h-12 text-sm pl-12 pr-4 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-primary transition-all focus:outline-none"
            autoFocus
          />
        </div>
      </div>


      {isSearching ? (
        <SearchResults
          query={debouncedQuery}
          results={searchResults}
          isLoading={searchLoading}
        />
      ) : (
        <>
          <div className="w-full max-w-160 flex flex-col items-center">
            {apps && (
              <p className="text-lg text-center">

                This is the January promptahon showcase! The competition saw more than 800 registered participants and {apps.length} submitted apps. Prompt your own app into existence on <a href="https://caffeine.ai" target="_blank" rel="noreferrer" className="underline text-primary hover:text-primary/80 transition-colors"
                >caffeine.ai</a>.
              </p>
            )}
          </div>
          <AppGallery apps={apps} isLoading={appsLoading} />
        </>
      )}

      {/* Footer */}
      <footer className="pb-8 text-center text-muted-foreground text-xs mt-auto">
        Running on the{" "}
        <a
          href="https://internetcomputer.org"
          className="underline text-primary"
          target="_blank"
          rel="noreferrer"
        >
          Internet Computer
        </a>
      </footer>
    </div>
  );
}
