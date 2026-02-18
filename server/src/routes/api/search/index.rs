use std::borrow::Cow;

use crate::app::AppManager;
use ic_asset_router::{route, HttpResponse, RouteContext, StatusCode};

#[derive(Default, serde::Deserialize)]
pub struct SearchParams {
    #[serde(default)]
    pub q: String,
}

#[route(certification = "skip")]
pub fn get(ctx: RouteContext<(), SearchParams>) -> HttpResponse<'static> {
    let query = &ctx.search.q;

    let apps = if query.trim().is_empty() {
        vec![]
    } else {
        AppManager::search(query).unwrap_or_default()
    };

    let body = serde_json::to_vec(&apps).unwrap_or_else(|_| b"[]".to_vec());

    HttpResponse::builder()
        .with_status_code(StatusCode::OK)
        .with_headers(vec![(
            "content-type".to_string(),
            "application/json".to_string(),
        )])
        .with_body(Cow::Owned(body))
        .build()
}
