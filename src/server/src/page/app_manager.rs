use super::app_types::App;
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
                  author_name,
                  app_name,
                  social_post_url,
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
                    author_name: row.get(6)?,
                    app_name: row.get(7)?,
                    social_post_url: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
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
              author_name,
              app_name,
              social_post_url,
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
                        author_name: row.get(6)?,
                        app_name: row.get(7)?,
                        social_post_url: row.get(8)?,
                        created_at: row.get(9)?,
                        updated_at: row.get(10)?,
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
              author_name,
              app_name,
              social_post_url,
              created_at,
              updated_at
            FROM app
            WHERE title LIKE ?1 OR description LIKE ?1 OR app_name LIKE ?1 OR author_name LIKE ?1
            ORDER BY 
              CASE 
                WHEN app_name LIKE ?1 THEN 1
                WHEN title LIKE ?1 THEN 2
                WHEN author_name LIKE ?1 THEN 3
                ELSE 4
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
                        author_name: row.get(6)?,
                        app_name: row.get(7)?,
                        social_post_url: row.get(8)?,
                        created_at: row.get(9)?,
                        updated_at: row.get(10)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            rows.collect::<ic_rusqlite::Result<Vec<_>>>()
                .map_err(|e| e.to_string())
        })
    }
}
