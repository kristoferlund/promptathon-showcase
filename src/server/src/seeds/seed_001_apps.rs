use ic_rusqlite::Connection;
use ic_sql_migrate::MigrateResult;

pub fn seed(conn: &Connection) -> MigrateResult<()> {
    let sql = include_str!("seed_apps.sql");
    conn.execute_batch(sql)?;
    Ok(())
}
