import * as cheerio from 'cheerio';
import { MetadataScrapeResult } from './types';

export async function scrapeUrlMetadata(targetUrl: string): Promise<MetadataScrapeResult> {
  let normalizedUrl = targetUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  const parsedUrl = new URL(normalizedUrl);
  const origin = parsedUrl.origin;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 QuickVault/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Title resolution priority
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const htmlTitle = $('title').first().text();
    const h1Title = $('h1').first().text();
    const title = (ogTitle || twitterTitle || htmlTitle || h1Title || parsedUrl.hostname).trim();

    // Description resolution priority
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const twitterDesc = $('meta[name="twitter:description"]').attr('content');
    const metaDesc = $('meta[name="description"]').attr('content');
    const description = (ogDesc || twitterDesc || metaDesc || '').trim();

    // OG Image resolution
    let ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      $('link[rel="image_src"]').attr('href') ||
      null;

    if (ogImage) {
      ogImage = resolveAbsoluteUrl(ogImage, origin, normalizedUrl);
    }

    // Favicon resolution
    let favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="apple-touch-icon-precomposed"]').attr('href') ||
      null;

    if (favicon) {
      favicon = resolveAbsoluteUrl(favicon, origin, normalizedUrl);
    } else {
      // High-reliability Google Favicon resolver fallback
      favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`;
    }

    const siteName =
      $('meta[property="og:site_name"]').attr('content') ||
      parsedUrl.hostname.replace(/^www\./, '');

    return {
      title: title || parsedUrl.hostname,
      description: description || `Resource from ${parsedUrl.hostname}`,
      ogImage,
      favicon,
      siteName,
      url: normalizedUrl,
    };
  } catch (error) {
    console.warn(`Scraping failed for ${normalizedUrl}:`, error);

    // Graceful fallback heuristics
    return {
      title: parsedUrl.hostname.replace(/^www\./, ''),
      description: `Saved bookmark from ${parsedUrl.hostname}`,
      ogImage: null,
      favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`,
      siteName: parsedUrl.hostname,
      url: normalizedUrl,
    };
  }
}

function resolveAbsoluteUrl(path: string, origin: string, baseUrl: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('//')) return 'https:' + path;
  if (path.startsWith('/')) return origin + path;

  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return origin + '/' + path.replace(/^\.\//, '');
  }
}
