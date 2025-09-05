import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // Test endpoint to verify API routes are working
  const env = {
    ASM_ACCOUNT: import.meta.env.ASM_ACCOUNT || 'undefined',
    ASM_BASE_URL: import.meta.env.ASM_BASE_URL || 'undefined',
    ASM_USERNAME: import.meta.env.ASM_USERNAME ? 'SET' : 'undefined',
    ASM_PASSWORD: import.meta.env.ASM_PASSWORD ? 'SET' : 'undefined',
  };

  return new Response(JSON.stringify({
    message: "Astro API routes are working!",
    timestamp: new Date().toISOString(),
    environment: env,
    url: request.url
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};