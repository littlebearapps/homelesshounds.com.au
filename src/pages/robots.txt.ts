// robots.txt endpoint - prerendered at build time
export const prerender = true;

export function GET() {
  const robotsTxt = [
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /*?*utm_*',
    'Disallow: /*?*sessionid=*',
    'Disallow: /*?*cf-turnstile-response=*',
    'Allow: /',
    '',
    '# Sitemaps',
    'Sitemap: https://homelesshounds.com.au/sitemap.xml',
    'Sitemap: https://homelesshounds-com-au.pages.dev/sitemap.xml',
    '',
    '# Crawl-delay for respectful crawling',
    'Crawl-delay: 1',
    ''
  ].join('\n');

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400' // Cache for 1 day
    }
  });
}