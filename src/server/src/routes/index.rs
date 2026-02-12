use std::borrow::Cow;

use crate::page::AppManager;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use minijinja::Environment;
use router_library::router::RouteParams;
use serde_json::json;
use url::Url;

pub fn handler(req: HttpRequest, _: RouteParams) -> HttpResponse<'static> {
    let html = include_str!("../../../../index.html");

    // Parse query parameter from URL
    let query = if let Ok(url) = Url::parse(&format!("http://localhost{}", req.url())) {
        url.query_pairs()
            .find(|(key, _)| key == "q")
            .map(|(_, value)| value.to_string())
            .unwrap_or_default()
    } else {
        ic_cdk::println!("Failed to parse URL");
        String::new()
    };

    // Perform search if query is present
    let results = if !query.is_empty() {
        let search_results = AppManager::search(&query).unwrap_or_default();
        ic_cdk::println!("Found {} results", search_results.len());
        search_results
    } else {
        Vec::new()
    };

    let env = Environment::new();
    let template = env.template_from_str(html).unwrap();
    let ctx = json!({
        "title": "Promptathon Showcase",
        "description": "A gallery showcasing apps built on the Internet Computer",
        "query": query,
        "results": results,
        "result_count": results.len(),
        "has_results": !results.is_empty(),
        "r2_public_url": crate::get_r2_public_url()
    });
    let rendered = template.render(ctx).unwrap();

    HttpResponse::builder()
        .with_headers(vec![
            ("Content-Type".into(), "text/html".into()),
            (
                "Cache-Control".into(),
                "no-store, no-cache, must-revalidate".into(),
            ),
        ])
        .with_status_code(StatusCode::OK)
        .with_body(Cow::Owned(rendered.into_bytes()))
        .build()
}
