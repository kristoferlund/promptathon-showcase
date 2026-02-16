import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { SearchQueryProvider } from "@/hooks/use-search-query";
import ArrowLeftIcon from "@/components/icons/arrow-left";

function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <p className="text-lg text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="text-primary hover:text-primary/80 no-underline text-sm inline-flex items-center gap-2 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Back to home
      </Link>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <SearchQueryProvider>
      <main className="min-h-screen flex flex-col bg-background">
        <Outlet />
      </main>
    </SearchQueryProvider>
  ),
  notFoundComponent: NotFound,
});
