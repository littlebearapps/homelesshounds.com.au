export const prerender = false;

export async function GET() {
  const env = {
    ASM_ACCOUNT: import.meta.env.ASM_ACCOUNT || 'undefined',
    ASM_BASE_URL: import.meta.env.ASM_BASE_URL || 'undefined',
    ASM_USERNAME: import.meta.env.ASM_USERNAME ? 'SET' : 'undefined',
    ASM_PASSWORD: import.meta.env.ASM_PASSWORD ? 'SET' : 'undefined',
  };

  return new Response(JSON.stringify({
    ok: true,
    where: "astro+cloudflare pages functions",
    message: "SSR API routes are working!",
    timestamp: new Date().toISOString(),
    environment: env
  }, null, 2), {
    headers: { 
      "content-type": "application/json" 
    }
  });
}