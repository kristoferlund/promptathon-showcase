import { Link } from "@tanstack/react-router";
import type { App } from "@/server";
import { R2_PUBLIC_URL } from "@/lib/constants";

export default function SearchResults({
  query,
  results,
  isLoading,
}: {
  query: string;
  results: App[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="w-full max-w-160 px-4 mt-10 pb-16">
        <div className="text-center text-muted-foreground text-sm">
          Searching...
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-160 px-4 mt-10 pb-16">
        <div className="text-center text-muted-foreground text-sm">
          No results found for &quot;{query}&quot;
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-160 px-4 mt-10 pb-16">
      <div className="text-xs text-muted-foreground mb-6 font-medium">
        {results.length} result{results.length !== 1 ? "s" : ""} for &quot;
        {query}&quot;
      </div>
      <div className="flex flex-col">
        {results.map((app) => (
          <Link
            key={app.id}
            to="/app/$id"
            params={{ id: String(app.id) }}
            search={{ ref: query }}
            className="block group"
          >
            <div className="flex items-center hover:bg-card/50 rounded p-3 gap-3">
              <div className="shrink-0 w-72 rounded overflow-hidden bg-card border-white/20 border ">
                <img
                  src={`${R2_PUBLIC_URL}/${app.image_id}_300.jpg`}
                  alt={app.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground leading-tight line-clamp-1">
                  {app.app_name || app.title}
                </div>
                <div className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                  {app.description}
                </div>
                {app.author_name && (
                  <div className="text-xs text-muted-foreground/50 leading-tight mt-0.5">
                    {app.author_name}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
