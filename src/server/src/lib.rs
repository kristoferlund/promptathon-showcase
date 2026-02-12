mod __route_tree;
mod page;
mod routes;
mod seeds;

use __route_tree::ROUTES;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_http_certification::{HttpRequest, HttpResponse};
use ic_rusqlite::{close_connection, with_connection, Connection};
use include_dir::{include_dir, Dir};
use router_library::{assets::certify_all_assets, HttpRequestOptions};
use std::cell::RefCell;

static ASSETS_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dist");
static MIGRATIONS: &[ic_sql_migrate::Migration] = ic_sql_migrate::include_migrations!();

thread_local! {
    static R2_PUBLIC_URL: RefCell<String> = RefCell::new(String::from("https://pub-49a1f9a421b446018aba218a9ccbca42.r2.dev"));
}

fn run_migrations_and_seeds() {
    with_connection(|mut conn| {
        let conn: &mut Connection = &mut conn;
        ic_sql_migrate::sqlite::migrate(conn, MIGRATIONS).unwrap();
        ic_sql_migrate::sqlite::seed(conn, seeds::SEEDS).unwrap();
    });
}

#[init]
fn init() {
    run_migrations_and_seeds();
    certify_all_assets(&ASSETS_DIR);
}

#[pre_upgrade]
fn pre_upgrade() {
    close_connection();
}

#[post_upgrade]
fn post_upgrade() {
    run_migrations_and_seeds();
    certify_all_assets(&ASSETS_DIR);
}

#[query]
pub fn http_request(req: HttpRequest) -> HttpResponse {
    let opts = if req.get_path().unwrap() == "/" {
        HttpRequestOptions { certify: false }
    } else {
        HttpRequestOptions::default()
    };

    ROUTES.with(|routes| router_library::http_request(req, routes, opts))
}

#[update]
fn http_request_update(req: HttpRequest) -> HttpResponse {
    ROUTES.with(|routes| router_library::http_request_update(req, routes))
}

pub fn get_r2_public_url() -> String {
    R2_PUBLIC_URL.with(|url| url.borrow().clone())
}

#[query]
fn search_apps(query: String) -> Result<Vec<page::App>, String> {
    page::AppManager::search(&query)
}
