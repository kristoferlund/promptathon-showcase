import { useQuery } from "@tanstack/react-query";
import { getActor, toAppData, type AppData } from "@/lib/actor";

export default function useListApps() {
  return useQuery<AppData[]>({
    queryKey: ["apps"],
    queryFn: async () => {
      const actor = getActor();
      const apps = await actor.list_apps();
      return apps.map(toAppData);
    },
  });
}
