import { createActor, type Server } from "../server";

const canisterId = (import.meta.env.CANISTER_ID_SERVER as string) || "";
const isLocal = window.location.host.includes("localhost");

let _actor: Server | null = null;

export function getActor(): Server {
  if (!canisterId) {
    throw new Error("CANISTER_ID_SERVER is not defined.");
  }
  if (!_actor) {
    _actor = createActor(canisterId, {
      agentOptions: { shouldFetchRootKey: isLocal },
    });
  }
  return _actor;
}

/** Normalized app data with number types instead of BigInt */
export interface AppData {
  id: number;
  url: string;
  canister_id?: string;
  title: string;
  description: string;
  image_id?: string;
  author_name?: string;
  app_name?: string;
  social_post_url?: string;
  created_at: number;
  updated_at: number;
}

export function toAppData(app: {
  id: bigint;
  url: string;
  canister_id?: string;
  title: string;
  description: string;
  image_id?: string;
  author_name?: string;
  app_name?: string;
  social_post_url?: string;
  created_at: bigint;
  updated_at: bigint;
}): AppData {
  return {
    id: Number(app.id),
    url: app.url,
    canister_id: app.canister_id,
    title: app.title,
    description: app.description,
    image_id: app.image_id,
    author_name: app.author_name,
    app_name: app.app_name,
    social_post_url: app.social_post_url,
    created_at: Number(app.created_at),
    updated_at: Number(app.updated_at),
  };
}
