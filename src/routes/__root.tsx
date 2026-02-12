import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <main className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Outlet />
    </main>
  ),
});
