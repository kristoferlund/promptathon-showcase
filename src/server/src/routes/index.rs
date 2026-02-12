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
    let search_results = if !query.is_empty() {
        let results = AppManager::search(&query).unwrap_or_default();
        ic_cdk::println!("Found {} results", results.len());
        results
    } else {
        Vec::new()
    };

    // Always load all apps for the gallery grid
    let all_apps = AppManager::list().unwrap_or_default();

    let env = Environment::new();
    let template = env.template_from_str(html).unwrap();
    let ctx = json!({
        "title": "Promptathon Showcase",
        "description": "A gallery showcasing apps built on the Internet Computer",
        "query": query,
        "search_results": search_results,
        "search_result_count": search_results.len(),
        "has_search_results": !search_results.is_empty(),
        "apps": all_apps,
        "app_count": all_apps.len(),
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
