use std::borrow::Cow;
use std::collections::HashMap;

use ic_asset_router::RouteContext;
use ic_http_certification::{HttpResponse, StatusCode};
use minijinja::Environment;

pub fn get(_ctx: RouteContext<()>) -> HttpResponse<'static> {
    let html = include_str!("../../../../dist/index.html");
    let env = Environment::new();
    let template = env.template_from_str(html).unwrap();
    let mut ctx = HashMap::new();
    ctx.insert("title", "Caffeine January Promptathon Showcase".to_string());
    ctx.insert(
        "description",
        "A gallery showcasing apps submitted to the January Caffeine promptathon.".to_string(),
    );
    ctx.insert("og_image", "/og-image.png".to_string());
    let rendered = template.render(ctx).unwrap();

    HttpResponse::builder()
        .with_headers(vec![("Content-Type".into(), "text/html".into())])
        .with_status_code(StatusCode::OK)
        .with_body(Cow::Owned(rendered.into_bytes()))
        .build()
}
