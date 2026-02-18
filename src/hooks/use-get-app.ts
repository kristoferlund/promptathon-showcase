import { useQuery } from "@tanstack/react-query";
import type { App } from "@/types";

export default function useGetApp(id: number) {
  return useQuery<App>({
    queryKey: ["app", id],
    queryFn: async () => {
      const res = await fetch(`/api/apps/${String(id)}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? "Failed to fetch app");
      }
      return (await res.json()) as App;
    },
    enabled: id > 0,
  });
}
