mod app;
mod ogimage;
mod routes;
mod seeds;

mod route_tree {
    include!(concat!(env!("OUT_DIR"), "/__route_tree.rs"));
}

use ic_asset_router::{
    assets::{certify_all_assets, delete_assets},
    set_asset_config, AssetConfig, HttpRequestOptions,
};
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_http_certification::{HttpRequest, HttpResponse};
use ic_rusqlite::{close_connection, with_connection, Connection};
use include_dir::{include_dir, Dir};

static ASSETS_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dist");
static MIGRATIONS: &[ic_sql_migrate::Migration] = ic_sql_migrate::include_migrations!();

fn run_migrations_and_seeds() {
    with_connection(|mut conn| {
        let conn: &mut Connection = &mut conn;
        ic_sql_migrate::sqlite::migrate(conn, MIGRATIONS).unwrap();
        ic_sql_migrate::sqlite::seed(conn, seeds::SEEDS).unwrap();
    });
}

fn setup_and_certify() {
    // Configure the asset router:
    // - Static assets (Vite bundles with content hashes): cached 1 year, immutable
    // - Dynamic assets (server-rendered HTML with SEO tags): cached 1 month
    // - Permissive security headers: suitable for SPA loading bundled fonts
    set_asset_config(AssetConfig {
        cache_control: ic_asset_router::CacheControl {
            dynamic_assets: "public, max-age=2592000".into(),
            ..ic_asset_router::CacheControl::default()
        },
        ..AssetConfig::default()
    });

    // Certify all pre-built assets produced by Vite (JS, CSS, fonts, images, etc.)
    certify_all_assets(&ASSETS_DIR);

    // Delete the pre-built index.html from the certified asset cache.
    // Page routes (/, /app/:id) will be generated dynamically with
    // route-specific SEO meta tags injected via minijinja on first request.
    delete_assets(vec!["/"]);
}

#[init]
fn init() {
    run_migrations_and_seeds();
    setup_and_certify();
}

#[pre_upgrade]
fn pre_upgrade() {
    close_connection();
}

#[post_upgrade]
fn post_upgrade() {
    run_migrations_and_seeds();
    setup_and_certify();
}

#[query]
pub fn http_request(req: HttpRequest) -> HttpResponse {
    route_tree::ROUTES
        .with(|routes| ic_asset_router::http_request(req, routes, HttpRequestOptions::default()))
}

#[update]
fn http_request_update(req: HttpRequest) -> HttpResponse {
    route_tree::ROUTES.with(|routes| ic_asset_router::http_request_update(req, routes))
}

/// Get the base URL for serving images. Images are bundled in the canister,
/// so this returns an empty string for canister-relative paths.
pub fn get_image_base_url() -> String {
    String::new()
}

// --- Candid API ---

#[query]
fn list_apps() -> Vec<app::App> {
    app::AppManager::list().unwrap_or_default()
}

#[query]
fn get_app(id: i64) -> Result<app::App, String> {
    app::AppManager::get_by_id(id)
}

#[query]
fn search(query: String) -> Result<Vec<app::App>, String> {
    app::AppManager::search(&query)
}
