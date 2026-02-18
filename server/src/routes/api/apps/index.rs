use std::borrow::Cow;

use crate::app::AppManager;
use ic_asset_router::RouteContext;
use ic_http_certification::{HttpResponse, StatusCode};

pub fn get(_ctx: RouteContext<()>) -> HttpResponse<'static> {
    let apps = AppManager::list().unwrap_or_default();
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
