mod __route_tree;
mod page;
mod routes;
mod seeds;

use __route_tree::ROUTES;
use candid::Principal;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_cdk::api::msg_caller;
use ic_http_certification::{HttpRequest, HttpResponse};
use ic_rusqlite::{close_connection, with_connection, Connection};
use include_dir::{include_dir, Dir};
use router_library::{assets::certify_all_assets, HttpRequestOptions};
use std::cell::RefCell;

static ASSETS_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dist");
static MIGRATIONS: &[ic_sql_migrate::Migration] = ic_sql_migrate::include_migrations!();

thread_local! {
    static ADMIN_PRINCIPAL: RefCell<Option<Principal>> = RefCell::new(None);
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
fn init(admin: Option<Principal>) {
    // Store admin principal if provided
    if let Some(principal) = admin {
        ADMIN_PRINCIPAL.with(|admin_principal| {
            *admin_principal.borrow_mut() = Some(principal);
        });
    }

    // Run database migrations and seeds
    run_migrations_and_seeds();

    //Certify all the pre-built assets produced by 'npm run build'
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

    // Serve assets that have already been certified, or upgrade the request to an update call
    ROUTES.with(|routes| router_library::http_request(req, routes, opts))
}

#[update]
fn http_request_update(req: HttpRequest) -> HttpResponse {
    // Match incoming requests to the appropriate handler, generating assets as needed
    ROUTES.with(|routes| router_library::http_request_update(req, routes))
}

fn is_admin() -> Result<(), String> {
    let caller_principal = msg_caller();
    ADMIN_PRINCIPAL.with(|admin| {
        let admin = admin.borrow();
        match *admin {
            Some(admin_principal) if admin_principal == caller_principal => Ok(()),
            Some(_) => Err("Unauthorized: caller is not admin".to_string()),
            None => Err("No admin principal configured".to_string()),
        }
    })
}

pub fn get_r2_public_url() -> String {
    R2_PUBLIC_URL.with(|url| url.borrow().clone())
}

#[query]
fn search_apps(query: String) -> Result<Vec<page::App>, String> {
    page::AppManager::search(&query)
}

#[update]
fn upsert_app(input: page::app_types::AppInput) -> Result<page::App, String> {
    is_admin()?;
    page::AppManager::upsert(input)
}

#[update]
fn delete_app_by_id(id: i64) -> Result<(), String> {
    is_admin()?;
    page::AppManager::delete_by_id(id)
}

#[update]
fn delete_app_by_url(url: String) -> Result<(), String> {
    is_admin()?;
    page::AppManager::delete_by_url(&url)
}
