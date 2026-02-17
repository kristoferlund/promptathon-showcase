use std::borrow::Cow;
use std::collections::HashMap;

use crate::page::AppManager;
use ic_asset_router::RouteContext;
use ic_http_certification::{HttpResponse, StatusCode};
use minijinja::Environment;

use super::Params;

pub fn get(ctx: RouteContext<Params>) -> HttpResponse<'static> {
    let html = include_str!("../../../../../dist/index.html");

    let id: i64 = match ctx.params.id.parse() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::builder()
                .with_headers(vec![("Content-Type".into(), "text/plain".into())])
                .with_status_code(StatusCode::BAD_REQUEST)
                .with_body(b"Invalid app ID".to_vec())
                .build();
        }
    };

    // Only query the DB for SEO meta tags (title, description, image)
    let (title, description, og_image) = match AppManager::get_by_id(id) {
        Ok(app) => {
            let og = format!("/app/{}/og.png", id);
            (app.title, app.description, og)
        }
        Err(_) => (
            "App Not Found".to_string(),
            "The requested app could not be found".to_string(),
            String::new(),
        ),
    };

    let env = Environment::new();
    let template = env.template_from_str(html).unwrap();
    let mut tpl_ctx = HashMap::new();
    tpl_ctx.insert("title".to_string(), title);
    tpl_ctx.insert("description".to_string(), description);
    tpl_ctx.insert("og_image".to_string(), og_image);
    let rendered = template.render(tpl_ctx).unwrap();

    HttpResponse::builder()
        .with_headers(vec![("Content-Type".into(), "text/html".into())])
        .with_status_code(StatusCode::OK)
        .with_body(Cow::Owned(rendered.into_bytes()))
        .build()
}
