function clamp(score) {
    return Math.max(0, Math.min(100, Math.round(score)));
}

function extractKeywords(bodyText, wordCount) {
    const stopWords = new Set([
        "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out",
        "this", "that", "with", "have", "from", "they", "will", "what", "when", "your", "about", "into",
        "more", "other", "some", "such", "than", "them", "then", "there", "these", "would", "which", "their",
        "been", "being", "also", "just", "like", "over", "after", "before", "between", "through", "during",
    ]);

    const words = (bodyText || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w));

    const counts = {};
    for (const word of words) {
        counts[word] = (counts[word] || 0) + 1;
    }

    const total = wordCount || words.length || 1;

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({
            word,
            count,
            density: Number(((count / total) * 100).toFixed(2)),
        }));
}

export function analyzeSeoDataFallback(scrapedData) {
    const { metaData = {}, headings = {}, links = {}, images = {}, loadTime = 0, pageSize = 0, wordCount = 0, bodyText = "" } = scrapedData;
    const issues = [];

    let seo = 100;
    let performance = 100;
    let accessibility = 100;
    let bestPractices = 100;

    if (!metaData.title) {
        seo -= 25;
        issues.push({
            severity: "critical",
            category: "SEO",
            message: "Missing page title tag.",
            recommendation: "Add a unique, descriptive title between 50–60 characters.",
        });
    } else if (metaData.title.length < 30 || metaData.title.length > 60) {
        seo -= 10;
        issues.push({
            severity: "warning",
            category: "SEO",
            message: `Title is ${metaData.title.length} characters (ideal: 50–60).`,
            recommendation: "Adjust the title length for better search result display.",
        });
    }

    if (!metaData.description) {
        seo -= 20;
        issues.push({
            severity: "critical",
            category: "SEO",
            message: "Missing meta description.",
            recommendation: "Add a compelling meta description around 150–160 characters.",
        });
    } else if (metaData.description.length < 120 || metaData.description.length > 160) {
        seo -= 8;
        issues.push({
            severity: "warning",
            category: "SEO",
            message: `Meta description is ${metaData.description.length} characters.`,
            recommendation: "Aim for 150–160 characters in the meta description.",
        });
    }

    if (headings.h1 === 0) {
        seo -= 15;
        issues.push({
            severity: "critical",
            category: "SEO",
            message: "No H1 heading found on the page.",
            recommendation: "Add exactly one H1 that describes the main topic of the page.",
        });
    } else if (headings.h1 > 1) {
        seo -= 10;
        issues.push({
            severity: "warning",
            category: "SEO",
            message: `Multiple H1 tags found (${headings.h1}).`,
            recommendation: "Use a single H1 and structure subtopics with H2–H6.",
        });
    }

    if (!metaData.canonical) {
        seo -= 5;
        issues.push({
            severity: "info",
            category: "SEO",
            message: "No canonical URL specified.",
            recommendation: "Add a canonical link tag to avoid duplicate content issues.",
        });
    }

    if (loadTime > 5000) {
        performance -= 40;
        issues.push({
            severity: "critical",
            category: "Performance",
            message: `Slow load time: ${loadTime}ms.`,
            recommendation: "Optimize images, reduce scripts, and enable caching to improve load time.",
        });
    } else if (loadTime > 3000) {
        performance -= 20;
        issues.push({
            severity: "warning",
            category: "Performance",
            message: `Load time is ${loadTime}ms (target: under 3000ms).`,
            recommendation: "Consider compressing assets and deferring non-critical JavaScript.",
        });
    }

    if (pageSize > 3 * 1024 * 1024) {
        performance -= 15;
        issues.push({
            severity: "warning",
            category: "Performance",
            message: `Large page size: ${Math.round(pageSize / 1024)}KB.`,
            recommendation: "Reduce page weight by optimizing images and removing unused resources.",
        });
    }

    if (images.total > 0 && images.missingAlt > 0) {
        const ratio = images.missingAlt / images.total;
        accessibility -= clamp(ratio * 50);
        issues.push({
            severity: ratio > 0.3 ? "critical" : "warning",
            category: "Accessibility",
            message: `${images.missingAlt} of ${images.total} images are missing alt text.`,
            recommendation: "Add descriptive alt text to all meaningful images.",
        });
    }

    if (!metaData.viewport) {
        bestPractices -= 15;
        issues.push({
            severity: "warning",
            category: "Best Practices",
            message: "Missing viewport meta tag.",
            recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
        });
    }

    if (!metaData.charset) {
        bestPractices -= 5;
    }

    if (!metaData.ogTitle && !metaData.ogDescription) {
        bestPractices -= 10;
        issues.push({
            severity: "info",
            category: "Best Practices",
            message: "Open Graph tags are missing or incomplete.",
            recommendation: "Add og:title, og:description, and og:image for better social sharing.",
        });
    }

    if (wordCount < 300) {
        seo -= 10;
        issues.push({
            severity: "info",
            category: "SEO",
            message: `Low word count: ${wordCount} words.`,
            recommendation: "Add more relevant content to improve topical authority.",
        });
    }

    const categories = {
        seo: clamp(seo),
        performance: clamp(performance),
        accessibility: clamp(accessibility),
        bestPractices: clamp(bestPractices),
    };

    const overallScore = clamp(
        (categories.seo + categories.performance + categories.accessibility + categories.bestPractices) / 4
    );

    const severityOrder = { critical: 0, warning: 1, info: 2 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
        success: true,
        data: {
            overallScore,
            categories,
            keywords: extractKeywords(bodyText, wordCount),
            issues,
        },
        source: "fallback",
    };
}
