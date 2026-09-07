import * as cheerio from 'cheerio';

function resolveUrl(base, relative) {
  if (!relative) return null;
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
  try {
    return new URL(relative, base).toString();
  } catch {
    return null;
  }
}

export async function scrapeMetadata(url) {
  const result = { url, title: null, description: null, ogImage: null, favicon: null, siteName: null };

  try {
    const fetchUrl = url.startsWith('http') ? url : `https://${url}`;
    const origin = new URL(fetchUrl).origin;

    const res = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuickVault/1.0; +https://quickvault.dev)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    result.title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      null;

    result.description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      null;

    result.ogImage = resolveUrl(
      fetchUrl,
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null,
    );

    result.siteName =
      $('meta[property="og:site_name"]').attr('content') || null;

    // Favicon: try several link tags
    const faviconRel = $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="icon"][type="image/svg+xml"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="icon"]').first().attr('href') ||
      null;

    result.favicon = faviconRel
      ? resolveUrl(fetchUrl, faviconRel)
      : `https://www.google.com/s2/favicons?domain=${origin}&sz=64`;

    if (result.title) result.title = result.title.trim().slice(0, 200);
    if (result.description) result.description = result.description.trim().slice(0, 500);
  } catch (err) {
    console.error('Scrape error for', url, err.message);
  }

  return result;
}
