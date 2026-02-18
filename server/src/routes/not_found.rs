use std::borrow::Cow;
use std::collections::HashMap;

use ic_asset_router::{HttpResponse, RouteContext, StatusCode};
use minijinja::Environment;

pub fn get(_ctx: RouteContext<()>) -> HttpResponse<'static> {
    let html = include_str!("../../../dist/index.html");
    let env = Environment::new();
    let template = env.template_from_str(html).unwrap();
    let mut ctx = HashMap::new();
    ctx.insert("title", "Page Not Found".to_string());
    ctx.insert(
        "description",
        "The page you are looking for does not exist.".to_string(),
    );
    ctx.insert("og_image", String::new());
    let rendered = template.render(ctx).unwrap();

    HttpResponse::builder()
        .with_headers(vec![("Content-Type".into(), "text/html".into())])
        .with_status_code(StatusCode::NOT_FOUND)
        .with_body(Cow::Owned(rendered.into_bytes()))
        .build()
}
