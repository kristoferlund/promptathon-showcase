use super::app_types::{App, AppInput};
use ic_rusqlite::with_connection;

pub struct AppManager {}

impl AppManager {
    pub fn get_by_id(id: i64) -> Result<App, String> {
        with_connection(|conn| {
            let sql = r#"
                SELECT
                  id,
                  url,
                  canister_id,
                  title,
                  description,
                  image_id,
                  created_at,
                  updated_at
                FROM app
                WHERE id = ?1
            "#;

            conn.query_row(sql, (id,), |row| {
                Ok(App {
                    id: row.get(0)?,
                    url: row.get(1)?,
                    canister_id: row.get(2)?,
                    title: row.get(3)?,
                    description: row.get(4)?,
                    image_id: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())
        })
    }

    pub fn list() -> Result<Vec<App>, String> {
        with_connection(|conn| {
            let sql = r#"
            SELECT
              id,
              url,
              canister_id,
              title,
              description,
              image_id,
              created_at,
              updated_at
            FROM app
            ORDER BY id
        "#;

            let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;

            let rows = stmt
                .query_map((), |row| {
                    Ok(App {
                        id: row.get(0)?,
                        url: row.get(1)?,
                        canister_id: row.get(2)?,
                        title: row.get(3)?,
                        description: row.get(4)?,
                        image_id: row.get(5)?,
                        created_at: row.get(6)?,
                        updated_at: row.get(7)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            rows.collect::<ic_rusqlite::Result<Vec<_>>>()
                .map_err(|e| e.to_string())
        })
    }

    pub fn search(query: &str) -> Result<Vec<App>, String> {
        if query.is_empty() {
            return Self::list();
        }

        with_connection(|conn| {
            let sql = r#"
            SELECT
              id,
              url,
              canister_id,
              title,
              description,
              image_id,
              created_at,
              updated_at
            FROM app
            WHERE title LIKE ?1 OR description LIKE ?1
            ORDER BY 
              CASE 
                WHEN title LIKE ?1 THEN 1
                ELSE 2
              END,
              id
        "#;

            let search_pattern = format!("%{}%", query);
            let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;

            let rows = stmt
                .query_map((search_pattern,), |row| {
                    Ok(App {
                        id: row.get(0)?,
                        url: row.get(1)?,
                        canister_id: row.get(2)?,
                        title: row.get(3)?,
                        description: row.get(4)?,
                        image_id: row.get(5)?,
                        created_at: row.get(6)?,
                        updated_at: row.get(7)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            rows.collect::<ic_rusqlite::Result<Vec<_>>>()
                .map_err(|e| e.to_string())
        })
    }

    pub fn upsert(input: AppInput) -> Result<App, String> {
        with_connection(|conn| {
            let sql = r#"
                INSERT INTO app (url, canister_id, title, description, image_id)
                VALUES (?1, ?2, ?3, ?4, ?5)
                ON CONFLICT(url) DO UPDATE SET
                    canister_id = ?2,
                    title = ?3,
                    description = ?4,
                    image_id = ?5,
                    updated_at = strftime('%s','now')
                RETURNING id, url, canister_id, title, description, image_id, created_at, updated_at
            "#;

            conn.query_row(
                sql,
                (
                    &input.url,
                    &input.canister_id,
                    &input.title,
                    &input.description,
                    &input.image_id,
                ),
                |row| {
                    Ok(App {
                        id: row.get(0)?,
                        url: row.get(1)?,
                        canister_id: row.get(2)?,
                        title: row.get(3)?,
                        description: row.get(4)?,
                        image_id: row.get(5)?,
                        created_at: row.get(6)?,
                        updated_at: row.get(7)?,
                    })
                },
            )
            .map_err(|e| e.to_string())
        })
    }

    pub fn delete_by_id(id: i64) -> Result<(), String> {
        with_connection(|conn| {
            let sql = "DELETE FROM app WHERE id = ?1";
            conn.execute(sql, (id,))
                .map_err(|e| e.to_string())?;
            Ok(())
        })
    }

    pub fn delete_by_url(url: &str) -> Result<(), String> {
        with_connection(|conn| {
            let sql = "DELETE FROM app WHERE url = ?1";
            conn.execute(sql, (url,))
                .map_err(|e| e.to_string())?;
            Ok(())
        })
    }
}
