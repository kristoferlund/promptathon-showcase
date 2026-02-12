use std::borrow::Cow;
use std::collections::HashMap;

use crate::page::AppManager;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use minijinja::Environment;
use router_library::router::RouteParams;

pub fn handler(_: HttpRequest, params: RouteParams) -> HttpResponse<'static> {
    let html = include_str!("../../../../dist/index.html");

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

    // Only query the DB for SEO meta tags (title, description, image)
    let (title, description, og_image) = match AppManager::get_by_id(id) {
        Ok(app) => {
            let og = app
                .image_id
                .map(|img_id| format!("{}/{}_1500.jpg", crate::get_r2_public_url(), img_id));
            (app.title, app.description, og)
        }
        Err(_) => (
            "App Not Found".to_string(),
            "The requested app could not be found".to_string(),
            None,
        ),
    };

    let env = Environment::new();
    let template = env.template_from_str(html).unwrap();
    let mut ctx = HashMap::new();
    ctx.insert("title".to_string(), title);
    ctx.insert("description".to_string(), description);
    ctx.insert("og_image".to_string(), og_image.unwrap_or_default());
    let rendered = template.render(ctx).unwrap();

    HttpResponse::builder()
        .with_headers(vec![("Content-Type".into(), "text/html".into())])
        .with_status_code(StatusCode::OK)
        .with_body(Cow::Owned(rendered.into_bytes()))
        .build()
}
