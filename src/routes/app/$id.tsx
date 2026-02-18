import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import useGetApp from "@/hooks/use-get-app";
import AppDetail from "@/components/app-detail";
import ArrowLeftIcon from "@/components/icons/arrow-left";

export const Route = createFileRoute("/app/$id")({
  component: AppDetailRoute,
});

function AppDetailRoute() {
  const { id } = Route.useParams();
  const { data: app, isLoading, error } = useGetApp(Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-8 py-12">
        <div className="mb-12">
          <Link
            to="/"
            className="hover:text-primary/80 no-underline text-sm inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Back
          </Link>
        </div>
        <article>
          {/* Title skeleton */}
          <div className="h-10 w-3/5 animate-pulse rounded bg-muted my-4" />

          {/* Header image skeleton */}
          <div className="w-full aspect-video animate-pulse rounded bg-muted" />

          {/* Description text skeleton */}
          <div className="my-6 flex flex-col gap-3">
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/5 animate-pulse rounded bg-muted" />
          </div>
        </article>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-12">
          <Link
            to="/"
            className="text-primary hover:text-primary/80 no-underline text-sm inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </Link>
        </div>
        <div className="text-muted-foreground text-sm">
          {error ? error.message : "App not found"}
        </div>
      </div>
    );
  }

  return <AppDetail app={app} />;
}
