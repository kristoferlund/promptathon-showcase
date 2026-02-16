use ic_asset_router::build::generate_routes;

fn main() {
    generate_routes();

    ic_sql_migrate::Builder::new()
        .with_migrations_dir("migrations")
        .with_seeds_dir("src/seeds")
        .build()
        .unwrap();
}
