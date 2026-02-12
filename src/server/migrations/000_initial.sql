CREATE TABLE IF NOT EXISTS app (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    url             TEXT NOT NULL UNIQUE,
    canister_id     TEXT,
    title           TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 100),
    description     TEXT NOT NULL CHECK (length(description) BETWEEN 10 AND 500),
    image_id        TEXT,  -- Base ID for R2 images (append _1500.jpg or _200.jpg)
    author_name     TEXT,
    app_name        TEXT,
    social_post_url TEXT,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
