use ic_rusqlite::Connection;
use ic_sql_migrate::MigrateResult;

pub fn seed(conn: &Connection) -> MigrateResult<()> {
    let apps = vec![
        (
            "https://bkyz2-fmaaa-aaaaa-qaaaq-cai.icp0.io",
            Some("bkyz2-fmaaa-aaaaa-qaaaq-cai"),
            "Getting Started with ICP",
            "Learn the basics of building decentralized applications on the Internet Computer Protocol. This comprehensive guide covers smart contracts, canisters, and essential development tools.",
            Some("screenshot-001")
        ),
        (
            "https://bd3sg-teaaa-aaaaa-qaaba-cai.icp0.io",
            Some("bd3sg-teaaa-aaaaa-qaaba-cai"),
            "Advanced Routing Patterns",
            "Explore dynamic server-side rendering techniques for SEO-optimized web applications. Discover how to implement file-based routing and certified assets on ICP.",
            Some("screenshot-002")
        ),
        (
            "https://be2us-64aaa-aaaaa-qaabq-cai.icp0.io",
            Some("be2us-64aaa-aaaaa-qaabq-cai"),
            "SQLite on the Blockchain",
            "Integrate persistent data storage into your canister smart contracts. This guide demonstrates best practices for database migrations and query optimization on ICP.",
            Some("screenshot-003")
        ),
        (
            "https://bkyz3-fmaaa-aaaaa-qaacq-cai.icp0.io",
            Some("bkyz3-fmaaa-aaaaa-qaacq-cai"),
            "Building Full-Stack dApps",
            "Master the art of creating production-ready decentralized applications. From React frontends to Rust backends, learn the complete development workflow.",
            Some("screenshot-004")
        ),
        (
            "https://bd3sh-teaaa-aaaaa-qaada-cai.icp0.io",
            Some("bd3sh-teaaa-aaaaa-qaada-cai"),
            "Security Best Practices",
            "Protect your applications with proper validation, authentication, and data integrity measures. Essential security patterns for Internet Computer development.",
            Some("screenshot-005")
        ),
    ];

    for (url, canister_id, title, description, image_id) in apps {
        conn.execute(
            "INSERT INTO app (url, canister_id, title, description, image_id) VALUES (?1, ?2, ?3, ?4, ?5)",
            (url, canister_id, title, description, image_id),
        )?;
    }

    Ok(())
}
