import { useMutation } from "@tanstack/react-query";
import { createActor, type App } from "../server";

const canisterId = import.meta.env.CANISTER_ID_SERVER as string || "";
const isLocal = window.location.host.includes("localhost");

export default function useSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      if (!canisterId) throw new Error("Server canisterId is not defined.")

      const actor = createActor(canisterId, { agentOptions: { shouldFetchRootKey: isLocal } });
      const result = await actor.search_apps(query);

      // Result is a Rust Result type with __kind__ discriminator
      if (result.__kind__ === "Err") {
        throw new Error(result.Err);
      }

      const apps = result.Ok;

      // Convert BigInt to number for easier handling
      return apps.map((app: App) => ({
        id: Number(app.id),
        canister_id: app.canister_id,
        title: app.title,
        description: app.description,
        image_id: app.image_id,
        created_at: Number(app.created_at),
        updated_at: Number(app.updated_at),
      }));
    },
  });
}
