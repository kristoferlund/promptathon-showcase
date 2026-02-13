import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SearchQueryProvider } from "@/hooks/use-search-query";

export const Route = createRootRoute({
  component: () => (
    <SearchQueryProvider>
      <main className="min-h-screen flex flex-col bg-background">
        <Outlet />
      </main>
    </SearchQueryProvider>
  ),
});
