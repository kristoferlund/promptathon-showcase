use std::sync::Arc;

use minijinja::Environment;
use resvg::{
    tiny_skia::{self, Pixmap},
    usvg::{fontdb, Options, Tree},
};

static OGIMAGE_TEMPLATE: &str = include_str!("includes/ogimage_template.svg");
static BG_IMAGE_DATA: &[u8] = include_bytes!("includes/og-background.png");
static FONT_DATA: &[u8] = include_bytes!("includes/SohneBreit-Halbfett.otf");
static FONT_DATA_LIGHT: &[u8] = include_bytes!("includes/Sohne-Leicht.otf");

/// Render an OG image PNG for the given app.
///
/// - `app_name`: display name shown at the top of the image
/// - `app_title`: shorter title shown below the app name (e.g. AI-generated title)
///
/// Returns the PNG bytes, or an error string.
pub fn render(app_name: &str, app_title: Option<&str>) -> Result<Vec<u8>, String> {
    // Build the background data URI (static, always present)
    let background_data_uri = format!("data:image/png;base64,{}", base64_encode(BG_IMAGE_DATA));

    // Render the SVG template with MiniJinja.
    // Text values must be XML-escaped since they're inserted into SVG (XML).
    let mut env = Environment::new();
    env.add_template("og", OGIMAGE_TEMPLATE)
        .map_err(|e| format!("Template parse error: {e}"))?;
    let tmpl = env.get_template("og").unwrap();
    let safe_name = xml_escape(app_name);
    let safe_title = app_title.map(|t| truncate(t, 80)).map(|t| xml_escape(&t));
    let ctx = minijinja::context! {
        app_name => safe_name,
        app_title => safe_title,
        background_data_uri => background_data_uri,
    };
    let svg_str = tmpl
        .render(ctx)
        .map_err(|e| format!("Template render error: {e}"))?;

    // Set up fontdb with a bundled font (WASM has no system fonts)
    let mut fontdb = fontdb::Database::new();
    fontdb.load_font_data(FONT_DATA.to_vec());
    fontdb.load_font_data(FONT_DATA_LIGHT.to_vec());

    let options = Options {
        font_family: "Sohne Breit".to_string(),
        fontdb: Arc::new(fontdb),
        ..Default::default()
    };

    // Parse SVG and render to PNG
    let tree = Tree::from_str(&svg_str, &options).map_err(|e| format!("SVG parse error: {e}"))?;

    let mut pixmap = Pixmap::new(1200, 630).ok_or_else(|| "Failed to create Pixmap".to_string())?;

    resvg::render(&tree, tiny_skia::Transform::default(), &mut pixmap.as_mut());

    pixmap
        .encode_png()
        .map_err(|e| format!("PNG encode error: {e}"))
}

/// Escape special XML characters in text content.
fn xml_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

/// Truncate a string to `max` characters on a char boundary, appending "..." if truncated.
fn truncate(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        s.to_string()
    } else {
        let truncated: String = s.chars().take(max - 1).collect();
        format!("{truncated}…")
    }
}

/// Simple base64 encoder (no external dependency needed).
fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    let mut result = String::with_capacity((data.len() + 2) / 3 * 4);
    let chunks = data.chunks(3);

    for chunk in chunks {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };

        let triple = (b0 << 16) | (b1 << 8) | b2;

        result.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        result.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);

        if chunk.len() > 1 {
            result.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }

        if chunk.len() > 2 {
            result.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }

    result
}
