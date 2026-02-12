import { useQuery } from "@tanstack/react-query";
import useServer from "@/hooks/use-server";
import type { App } from "@/server";

export default function useSearch(query: string) {
  const server = useServer();

  return useQuery<App[]>({
    queryKey: ["search", query],
    queryFn: async () => {
      const result = await server!.search(query);

      if (result.__kind__ === "Err") {
        throw new Error(result.Err);
      }

      return result.Ok;
    },
    enabled: !!server && query.trim().length > 0,
    structuralSharing: false,
  });
}
