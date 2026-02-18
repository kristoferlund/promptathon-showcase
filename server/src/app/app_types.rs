use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct App {
    pub id: i64,
    pub url: String,
    pub canister_id: Option<String>,
    pub title: String,
    pub description: String,
    pub image_id: Option<String>,
    pub author_name: Option<String>,
    pub app_name: Option<String>,
    pub social_post_url: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}
