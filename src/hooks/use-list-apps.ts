import { useQuery } from "@tanstack/react-query";
import type { App } from "@/types";

export default function useListApps() {
  return useQuery<App[]>({
    queryKey: ["apps"],
    queryFn: async () => {
      const res = await fetch("/api/apps");
      if (!res.ok) throw new Error("Failed to fetch apps");
      return (await res.json()) as App[];
    },
  });
}
