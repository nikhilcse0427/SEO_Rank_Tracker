import * as cheerio from "cheerio";

function getMeta($, name) {
    const el = $(`meta[name="${name}"]`).first();
    if (el.length) return el.attr("content") || "";
    const prop = $(`meta[property="${name}"]`).first();
    return prop.attr("content") || "";
}

export async function scrapeUrlFetch(url) {
    try {
        const startTime = Date.now();
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml",
            },
            redirect: "follow",
            signal: AbortSignal.timeout(30000),
        });

        const html = await response.text();
        const loadTime = Date.now() - startTime;
        const $ = cheerio.load(html);

        const title = $("title").first().text().trim() || "";
        const description = getMeta($, "description");
        const canonical = $('link[rel="canonical"]').attr("href") || "";
        const robots = getMeta($, "robots");
        const ogTitle = getMeta($, "og:title");
        const ogDescription = getMeta($, "og:description");
        const ogImage = getMeta($, "og:image");
        const twitterCard = getMeta($, "twitter:card");
        const viewport = getMeta($, "viewport");
        const charset = $("meta[charset]").attr("charset") || "";

        const h1Texts = [];
        $("h1").each((_, el) => {
            const text = $(el).text().trim();
            if (text) h1Texts.push(text);
        });

        const headings = {
            h1: $("h1").length,
            h2: $("h2").length,
            h3: $("h3").length,
            h4: $("h4").length,
            h5: $("h5").length,
            h6: $("h6").length,
            h1Texts,
        };

        let currentHost;
        try {
            currentHost = new URL(url).hostname;
        } catch {
            currentHost = "";
        }

        let internalLinks = 0;
        let externalLinks = 0;
        $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;
            try {
                const linkUrl = new URL(href, url);
                if (linkUrl.hostname === currentHost) internalLinks++;
                else externalLinks++;
            } catch {}
        });

        const allImages = $("img");
        let missingAlt = 0;
        allImages.each((_, el) => {
            const alt = $(el).attr("alt");
            if (!alt || !alt.trim()) missingAlt++;
        });

        const bodyText = $("body").text().replace(/\s+/g, " ").trim();
        const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
        const pageSize = Buffer.byteLength(html, "utf8");

        return {
            success: true,
            data: {
                metaData: { title, description, canonical, robots, ogTitle, ogDescription, ogImage, twitterCard, viewport, charset },
                headings,
                links: { internal: internalLinks, external: externalLinks, total: internalLinks + externalLinks },
                images: { total: allImages.length, missingAlt, withAlt: allImages.length - missingAlt },
                wordCount,
                pageSize,
                bodyText: bodyText.substring(0, 3000),
                loadTime,
                statusCode: response.status,
                url,
            },
            source: "fetch",
        };
    } catch (error) {
        console.error("[SCRAPER-FETCH] Failed:", error.message);
        return { success: false, error: error.message };
    }
}
