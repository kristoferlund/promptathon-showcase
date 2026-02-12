use std::borrow::Cow;

use crate::page::AppManager;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use minijinja::Environment;
use router_library::router::RouteParams;
use serde_json::json;

pub fn handler(_: HttpRequest, params: RouteParams) -> HttpResponse<'static> {
    let html = include_str!("../../../../../app.html");

    let id_str = params.get("id").unwrap();
    let id: i64 = match id_str.parse() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::builder()
                .with_headers(vec![("Content-Type".into(), "text/plain".into())])
                .with_status_code(StatusCode::BAD_REQUEST)
                .with_body(b"Invalid app ID".to_vec())
                .build();
        }
    };

    let app = match AppManager::get_by_id(id) {
        Ok(app) => app,
        Err(_) => {
            return HttpResponse::builder()
                .with_headers(vec![("Content-Type".into(), "text/plain".into())])
                .with_status_code(StatusCode::NOT_FOUND)
                .with_body(b"App not found".to_vec())
                .build();
        }
    };

    let created_date = chrono::DateTime::from_timestamp(app.created_at, 0)
        .map(|dt| dt.format("%B %d, %Y").to_string())
        .unwrap_or_else(|| "Unknown".to_string());

    let env = Environment::new();
    let template = env.template_from_str(html).unwrap();
    let ctx = json!({
        "id": app.id,
        "canister_id": app.canister_id,
        "url": app.url,
        "title": app.title,
        "description": app.description,
        "image_id": app.image_id,
        "created_at": created_date,
        "r2_public_url": crate::get_r2_public_url()
    });
    let rendered = template.render(ctx).unwrap();

    HttpResponse::builder()
        .with_headers(vec![("Content-Type".into(), "text/html".into())])
        .with_status_code(StatusCode::OK)
        .with_body(Cow::Owned(rendered.into_bytes()))
        .build()
}
