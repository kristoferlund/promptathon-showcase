import { useQuery } from "@tanstack/react-query";
import useServer from "@/hooks/use-server";
import type { App } from "@/server";

export type { App };

export default function useListApps() {
  const server = useServer();

  return useQuery<App[]>({
    queryKey: ["apps"],
    queryFn: () => server!.list_apps(),
    enabled: !!server,
    structuralSharing: false,
  });
}
