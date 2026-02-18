export interface App {
  id: number;
  url: string;
  canister_id: string | null;
  title: string;
  description: string;
  image_id: string | null;
  author_name: string | null;
  app_name: string | null;
  social_post_url: string | null;
  created_at: number;
  updated_at: number;
}
