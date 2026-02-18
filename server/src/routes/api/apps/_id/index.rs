use std::borrow::Cow;

use crate::app::AppManager;
use ic_asset_router::{HttpResponse, RouteContext, StatusCode};

use super::Params;

pub fn get(ctx: RouteContext<Params>) -> HttpResponse<'static> {
    let id: i64 = match ctx.params.id.parse() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::builder()
                .with_status_code(StatusCode::BAD_REQUEST)
                .with_headers(vec![(
                    "content-type".to_string(),
                    "application/json".to_string(),
                )])
                .with_body(Cow::Borrowed(br#"{"error":"Invalid app ID"}"# as &[u8]))
                .build();
        }
    };

    match AppManager::get_by_id(id) {
        Ok(app) => {
            let body = serde_json::to_vec(&app).unwrap_or_else(|_| b"{}".to_vec());
            HttpResponse::builder()
                .with_status_code(StatusCode::OK)
                .with_headers(vec![(
                    "content-type".to_string(),
                    "application/json".to_string(),
                )])
                .with_body(Cow::Owned(body))
                .build()
        }
        Err(_) => HttpResponse::builder()
            .with_status_code(StatusCode::NOT_FOUND)
            .with_headers(vec![(
                "content-type".to_string(),
                "application/json".to_string(),
            )])
            .with_body(Cow::Borrowed(br#"{"error":"App not found"}"# as &[u8]))
            .build(),
    }
}
