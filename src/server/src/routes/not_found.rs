use ic_asset_router::RouteContext;
use ic_http_certification::HttpResponse;

pub fn get(_ctx: RouteContext<()>) -> HttpResponse<'static> {
    HttpResponse::not_found(
        b"Not Found",
        vec![("Content-Type".into(), "text/plain".into())],
    )
    .build()
}
