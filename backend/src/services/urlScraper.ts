/**
 * URL Scraper Service
 * 
 * Utilities to fetch and extract text content from URLs for report generation.
 * Optimized for Google Docs and generic HTML pages without external dependencies.
 */

/**
 * Extract text content from a given URL
 * Handles Google Docs specially to get clean text.
 */
export async function scrapeUrl(url: string): Promise<string | null> {
    try {
        if (!url || !url.startsWith('http')) {
            return null;
        }

        // 1. Google Docs Optimization
        if (url.includes('docs.google.com/document/d/')) {
            return await scrapeGoogleDoc(url);
        }

        // 2. Generic Fallback
        return await scrapeGenericUrl(url);

    } catch (error) {
        console.warn(`Failed to scrape URL ${url}:`, error);
        return null;
    }
}

/**
 * Specialized scraper for Google Docs
 * Converts /edit URLs to /export?format=txt to get raw text
 */
async function scrapeGoogleDoc(url: string): Promise<string | null> {
    try {
        // Extract Doc ID
        // Pattern: .../d/DOC_ID/...
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!match || !match[1]) {
            return null;
        }

        const docId = match[1];
        const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

        const response = await fetch(exportUrl);
        if (!response.ok) {
            console.warn(`Google Doc export failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const text = await response.text();
        // Remove BOM if present
        return text.replace(/^\uFEFF/, '').trim();

    } catch (error) {
        console.error('Error scraping Google Doc:', error);
        return null;
    }
}

/**
 * Generic scraper for standard web pages
 * Fetches HTML and uses Regex to strip tags (lightweight, no cheerio)
 */
async function scrapeGenericUrl(url: string): Promise<string | null> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return null;
        }

        const html = await response.text();

        // Basic HTML cleanup using Regex (Mental model: "Poor man's Cheerio")

        // 1. Remove Scripts and Styles
        let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, " ");
        text = text.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, " ");

        // 2. Remove HTML Tags
        text = text.replace(/<[^>]+>/g, " ");

        // 3. Decode entities (basic ones)
        text = text.replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"');

        // 4. Collapse whitespace
        text = text.replace(/\s+/g, " ").trim();

        // Limit length to avoid overwhelming the AI context window
        return text.substring(0, 15000); // ~3-4k tokens

    } catch (error) {
        console.warn('Error scraping generic URL:', error);
        return null; // Fail gracefully
    }
}
