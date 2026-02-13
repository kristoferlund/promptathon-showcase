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
