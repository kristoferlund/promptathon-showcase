import { createFileRoute, useNavigate, useSearch as useRouterSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSearch from "../hooks/use-search";
import { Search } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
    };
  },
});

function Index() {
  const navigate = useNavigate();
  const searchParams = useRouterSearch({ from: "/" });
  const [query, setQuery] = useState(searchParams.q || "");
  const { mutate: search, isPending, data: results } = useSearch();

  useEffect(() => {
    if (searchParams.q && searchParams.q.trim()) {
      setQuery(searchParams.q);
      search(searchParams.q);
    }
  }, [searchParams.q, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    void navigate({
      to: "/",
      search: { q: query },
      replace: false,
    });

    search(query)
  };

  return (
    <div className="flex flex-col bg-[#0a0a0a] w-[640px]">
      {/* Search Interface */}
      <div className={`flex-1 flex flex-col items-center justify-center px-4 transition-all duration-300`}>
        <div className="w-full max-w-[640px]">
          {/* Logo/Title */}
          <div className="text-center mb-10">
            <h1 className={`font-semibold text-white mb-3 transition-all duration-300 text-5xl tracking-tight`}>
              Promptathon Showcase
            </h1>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <Search size={18} />
                </div>
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); }}
                  placeholder="Search pages..."
                  className="w-full h-12 text-[15px] pl-12 pr-4 rounded-lg border-0 bg-white/[0.08] text-white placeholder:text-white/30 focus:bg-white/[0.12] transition-all focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={isPending || !query.trim()}
                className="h-12 px-6 bg-white/[0.08] hover:bg-white/[0.12] text-white/90 border-0 rounded-lg font-medium text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {results && results.length > 0 && (
        <div className="w-full max-w-[640px] mx-auto px-4 pb-16">
          <div className="text-xs text-white/40 mb-6 font-medium">
            About {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-7">
            {results.map((app) => (
              <a
                key={app.id}
                href={`/app/${app.canister_id}${searchParams.q ? `?ref=${encodeURIComponent(searchParams.q)}` : ''}`}
                className="block group"
              >
                <div className="text-[13px] text-emerald-500/90 mb-2 flex items-center gap-2 font-medium font-mono">
                  {app.canister_id}
                </div>
                <div className="text-xl font-medium text-[#5b9cf4] group-hover:underline mb-2 transition-colors leading-snug">
                  {app.title}
                </div>
                <div className="text-white/60 text-[14px] leading-relaxed line-clamp-2">
                  {app.description}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="w-full max-w-[640px] mx-auto px-4 pb-16">
          <div className="text-center text-white/50 text-sm">
            No results found for &quot;{query}&quot;
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 text-center text-white/25 text-xs">
        Powered by SQLite on the Internet Computer
      </footer>
    </div>
  );
}
