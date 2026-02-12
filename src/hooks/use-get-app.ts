import { useQuery } from "@tanstack/react-query";
import { getActor, toAppData, type AppData } from "@/lib/actor";

export default function useGetApp(id: number) {
  return useQuery<AppData>({
    queryKey: ["app", id],
    queryFn: async () => {
      const actor = getActor();
      const result = await actor.get_app(BigInt(id));

      if (result.__kind__ === "Err") {
        throw new Error(result.Err);
      }

      return toAppData(result.Ok);
    },
    enabled: id > 0,
  });
}
