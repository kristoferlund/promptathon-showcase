use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, CandidType)]
pub struct App {
    pub id: i64,
    pub url: String,
    pub canister_id: Option<String>,
    pub title: String,
    pub description: String,
    pub image_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(CandidType, Deserialize)]
pub struct AppInput {
    pub url: String,
    pub canister_id: Option<String>,
    pub title: String,
    pub description: String,
    pub image_id: Option<String>,
}
