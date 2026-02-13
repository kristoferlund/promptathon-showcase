use std::sync::Arc;

use handlebars::Handlebars;
use include_dir::Dir;
use resvg::{
    tiny_skia::{self, Pixmap},
    usvg::{fontdb, Options, Tree},
};
use serde_json::json;

static OGIMAGE_TEMPLATE: &str = include_str!("includes/ogimage_template.svg");
static BG_IMAGE_DATA: &[u8] = include_bytes!("includes/og-background.png");
static FONT_DATA: &[u8] = include_bytes!("includes/Sohne-Kraftig.otf");

/// Render an OG image PNG for the given app.
///
/// - `app_name`: display name shown at the top of the image
/// - `app_title`: shorter title shown below the app name (e.g. AI-generated title)
/// - `image_id`: optional image_id used to load the 300px thumbnail from the
///   embedded `ASSETS_DIR` (`images/{image_id}_300.jpg`)
/// - `assets_dir`: the compile-time-embedded `dist/` directory
///
/// Returns the PNG bytes, or an error string.
pub fn render(
    app_name: &str,
    app_title: Option<&str>,
    image_id: Option<&str>,
    assets_dir: &Dir<'_>,
) -> Result<Vec<u8>, String> {
    // Build the background data URI (static, always present)
    let background_data_uri = format!("data:image/png;base64,{}", base64_encode(BG_IMAGE_DATA));

    // Build the thumbnail data URI if we have an image
    let thumbnail_data_uri = image_id.and_then(|id| {
        let path = format!("images/{}_1500.jpg", id);
        assets_dir.get_file(&path).map(|file| {
            let bytes = file.contents();
            let b64 = base64_encode(bytes);
            format!("data:image/jpeg;base64,{}", b64)
        })
    });

    // Render the SVG template with Handlebars
    let handlebars = Handlebars::new();
    let data = json!({
        "app_name": app_name,
        "app_title": app_title,
        "background_data_uri": background_data_uri,
        "thumbnail_data_uri": thumbnail_data_uri,
    });
    let svg_str = handlebars
        .render_template(OGIMAGE_TEMPLATE, &data)
        .map_err(|e| format!("Handlebars render error: {e}"))?;

    // Set up fontdb with a bundled font (WASM has no system fonts)
    let mut fontdb = fontdb::Database::new();
    fontdb.load_font_data(FONT_DATA.to_vec());

    let options = Options {
        font_family: "Sohne".to_string(),
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
