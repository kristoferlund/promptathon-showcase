use std::borrow::Cow;

use crate::page::AppManager;
use crate::ASSETS_DIR;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use router_library::router::RouteParams;

pub fn handler(_: HttpRequest, params: RouteParams) -> HttpResponse<'static> {
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

    // Look up the app to get its name and image_id
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

    let app_name = app.app_name.as_deref().unwrap_or(&app.title);
    // Show the AI-generated title as subtitle, but only if it differs from app_name
    let app_title = if app.title != app_name {
        Some(app.title.as_str())
    } else {
        None
    };
    let image_id = app.image_id.as_deref();

    match crate::ogimage::render(app_name, app_title, image_id, &ASSETS_DIR) {
        Ok(png_bytes) => HttpResponse::builder()
            .with_headers(vec![("Content-Type".into(), "image/png".into())])
            .with_status_code(StatusCode::OK)
            .with_body(Cow::Owned(png_bytes))
            .build(),
        Err(e) => HttpResponse::builder()
            .with_headers(vec![("Content-Type".into(), "text/plain".into())])
            .with_status_code(StatusCode::INTERNAL_SERVER_ERROR)
            .with_body(Cow::Owned(
                format!("OG image generation failed: {e}").into_bytes(),
            ))
            .build(),
    }
}
