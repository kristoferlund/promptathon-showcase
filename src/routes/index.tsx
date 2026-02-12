import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import useListApps from "@/hooks/use-list-apps";
import useSearch from "@/hooks/use-search";
import { R2_PUBLIC_URL } from "@/lib/constants";
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
});

function Index() {
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q);
  const { data: apps, isLoading: appsLoading } = useListApps();
  const { data: searchResults, isLoading: searchLoading } = useSearch(q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({
      to: "/",
      search: { q: query.trim() },
      replace: false,
    });
  };

  const isSearching = q.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-[640px] px-4 pt-16 flex flex-col items-center">
        <h1 className="font-semibold text-foreground text-4xl tracking-tight">
          Promptathon Showcase
        </h1>
        {apps && (
          <p className="text-muted-foreground text-sm mt-4">
            {apps.length} apps built with prompts
          </p>
        )}
      </div>

      {/* Search Form */}
      <div className="w-full max-w-[640px] px-4 mt-8">
        <form onSubmit={handleSearch}>
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); }}
              placeholder="Search apps..."
              autoComplete="off"
              className="w-full h-12 text-[15px] pl-12 pr-4 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-primary transition-all focus:outline-none"
              autoFocus
            />
          </div>
        </form>
      </div>

      {isSearching ? (
        <SearchResults
          query={q}
          results={searchResults}
          isLoading={searchLoading}
        />
      ) : (
        <AppGallery apps={apps} isLoading={appsLoading} />
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

function SearchResults({
  query,
  results,
  isLoading,
}: {
  query: string;
  results: ReturnType<typeof useSearch>["data"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="w-full max-w-[640px] px-4 mt-10 pb-16">
        <div className="text-center text-muted-foreground text-sm">
          Searching...
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-[640px] px-4 mt-10 pb-16">
        <div className="text-center text-muted-foreground text-sm">
          No results found for &quot;{query}&quot;
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[640px] px-4 mt-10 pb-16">
      <div className="text-xs text-muted-foreground mb-6 font-medium">
        {results.length} result{results.length !== 1 ? "s" : ""} for &quot;
        {query}&quot;
      </div>
      <div className="flex flex-col space-y-5">
        {results.map((app) => (
          <Link
            key={app.id}
            to="/app/$id"
            params={{ id: String(app.id) }}
            search={{ ref: query }}
            className="block group"
          >
            {app.image_id ? (
              <div className="flex gap-4 items-center">
                <div className="flex-shrink-0 w-52 h-28 rounded overflow-hidden bg-card">
                  <img
                    src={`${R2_PUBLIC_URL}/${app.image_id}_200.jpg`}
                    alt={app.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {app.app_name && (
                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                      {app.app_name}
                      {app.author_name && ` by ${app.author_name}`}
                    </div>
                  )}
                  <div className="text-lg font-medium text-primary group-hover:text-primary/80 mb-1 transition-colors leading-snug">
                    {app.title}
                  </div>
                  <div className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {app.description}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {app.app_name && (
                  <div className="text-xs text-muted-foreground mb-1 font-medium">
                    {app.app_name}
                    {app.author_name && ` by ${app.author_name}`}
                  </div>
                )}
                <div className="text-lg font-medium text-primary group-hover:text-primary/80 mb-1 transition-colors leading-snug">
                  {app.title}
                </div>
                <div className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  {app.description}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AppGallery({
  apps,
  isLoading,
}: {
  apps: ReturnType<typeof useListApps>["data"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="w-full px-6 mt-12 pb-16">
        <div className="text-center text-muted-foreground text-sm">
          Loading apps...
        </div>
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-6 mt-12 pb-16">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 200px)",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {apps.map((app) => (
          <Link
            key={app.id}
            to="/app/$id"
            params={{ id: String(app.id) }}
            search={{ ref: "" }}
            className="group block rounded-lg overflow-hidden transition-all"
            style={{ width: 200 }}
          >
            {app.image_id ? (
              <div
                className="overflow-hidden rounded-lg bg-secondary"
                style={{ width: 200, height: 112 }}
              >
                <img
                  src={`${R2_PUBLIC_URL}/${app.image_id}_200.jpg`}
                  alt={app.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="rounded-lg bg-secondary flex items-center justify-center"
                style={{ width: 200, height: 112 }}
              >
                <span
                  className="text-muted-foreground"
                  style={{ fontSize: 10 }}
                >
                  No preview
                </span>
              </div>
            )}
            <div style={{ padding: "6px 2px" }}>
              <div
                className="font-medium text-foreground leading-tight line-clamp-1"
                style={{ fontSize: 12 }}
              >
                {app.app_name || app.title}
              </div>
              {app.author_name && (
                <div
                  className="text-muted-foreground/50 leading-tight"
                  style={{ fontSize: 10, marginTop: 2 }}
                >
                  {app.author_name}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
