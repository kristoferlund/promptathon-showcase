import { useQuery } from "@tanstack/react-query";
import type { App } from "@/types";

export default function useGetApp(id: number) {
  return useQuery<App>({
    queryKey: ["app", id],
    queryFn: async () => {
      const res = await fetch(`/api/apps/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch app");
      }
      return res.json();
    },
    enabled: id > 0,
  });
}
