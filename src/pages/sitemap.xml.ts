import type { APIRoute } from 'astro';

// Sitemap index that combines static and dynamic sitemaps
export const prerender = false; // Dynamic to always include latest

export const GET: APIRoute = async () => {
  const timestamp = new Date().toISOString();

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://homelesshounds.com.au/sitemap-0.xml</loc>
    <lastmod>${timestamp}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://homelesshounds.com.au/sitemaps/pets.xml</loc>
    <lastmod>${timestamp}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
};