import { useQuery } from "@tanstack/react-query";
import type { App } from "@/types";

export default function useSearch(query: string) {
  return useQuery<App[]>({
    queryKey: ["search", query],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: query.trim().length >= 3,
  });
}
