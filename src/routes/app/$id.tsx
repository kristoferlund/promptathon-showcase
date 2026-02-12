import { createFileRoute, Link } from "@tanstack/react-router";
import useGetApp from "@/hooks/use-get-app";
import { R2_PUBLIC_URL } from "@/lib/constants";

export const Route = createFileRoute("/app/$id")({
  component: AppDetail,
  validateSearch: (search: Record<string, unknown>) => ({
    ref: (search.ref as string) || "",
  }),
});

function AppDetail() {
  const { id } = Route.useParams();
  const { ref: searchRef } = Route.useSearch();
  const { data: app, isLoading, error } = useGetApp(Number(id));

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-12">
          <Link
            to="/"
            search={{ q: "" }}
            className="text-primary hover:text-primary/80 no-underline text-sm inline-flex items-center gap-2 transition-colors"
          >
            &larr; Back
          </Link>
        </div>
        <div className="text-muted-foreground text-sm">
          {error ? error.message : "App not found"}
        </div>
      </div>
    );
  }

  const createdDate = app.created_at
    ? new Date(Number(app.created_at) * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <div className="mb-12">
        <Link
          to="/"
          search={{ q: searchRef || "" }}
          className="text-primary hover:text-primary/80 no-underline text-sm inline-flex items-center gap-2 transition-colors"
        >
          &larr; {searchRef ? "Search" : "Back"}
        </Link>
      </div>

      <article>
        <h1 className="text-4xl font-bold text-foreground my-4 leading-tight">
          {app.title}
        </h1>

        {app.url && (
          <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2 font-medium">
            <a
              href={app.url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {app.url}
            </a>
          </div>
        )}

        {app.image_id && (
          <div className="w-full rounded-xl my-8 overflow-hidden bg-card">
            <img
              src={`${R2_PUBLIC_URL}/${app.image_id}_1500.jpg`}
              alt={app.title}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        )}

        <div className="text-lg text-muted-foreground my-6 leading-relaxed">
          {app.description}
        </div>

        <div className="text-sm text-muted-foreground mt-12 pt-8 border-t border-border">
          Created: {createdDate}
        </div>
      </article>
    </div>
  );
}
