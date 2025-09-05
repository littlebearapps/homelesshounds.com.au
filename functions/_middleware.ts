// Cloudflare Pages Middleware for security headers
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  
  // Clone the response to modify headers
  const newResponse = new Response(response.body, response);
  
  // Add security headers
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy - allow ASM resources
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob: https://service.sheltermanager.com https://*.sheltermanager.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://service.sheltermanager.com https://*.sheltermanager.com",
    "style-src 'self' 'unsafe-inline'",
    "frame-src 'self' https://service.sheltermanager.com https://*.sheltermanager.com",
    "connect-src 'self' https://service.sheltermanager.com https://*.sheltermanager.com",
    "font-src 'self' data:",
  ].join('; ');
  
  newResponse.headers.set('Content-Security-Policy', csp);
  
  return newResponse;
};