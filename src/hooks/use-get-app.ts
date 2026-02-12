import { useQuery } from "@tanstack/react-query";
import useServer from "@/hooks/use-server";
import type { App } from "@/server";

export default function useGetApp(id: number) {
  const server = useServer();

  return useQuery<App>({
    queryKey: ["app", id],
    queryFn: async () => {
      const result = await server!.get_app(BigInt(id));

      if (result.__kind__ === "Err") {
        throw new Error(result.Err);
      }

      return result.Ok;
    },
    enabled: !!server && id > 0,
    structuralSharing: false,
  });
}
