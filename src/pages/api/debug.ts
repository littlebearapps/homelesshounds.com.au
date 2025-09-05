export const prerender = false;

export async function GET({ locals }) {
  // Try both import.meta.env and locals.runtime.env for Cloudflare Pages
  const env = {
    // import.meta.env access
    meta_ASM_ACCOUNT: import.meta.env.ASM_ACCOUNT || 'undefined',
    meta_ASM_BASE_URL: import.meta.env.ASM_BASE_URL || 'undefined', 
    meta_ASM_USERNAME: import.meta.env.ASM_USERNAME ? 'SET' : 'undefined',
    meta_ASM_PASSWORD: import.meta.env.ASM_PASSWORD ? 'SET' : 'undefined',
    
    // Cloudflare runtime access
    runtime_ASM_ACCOUNT: locals?.runtime?.env?.ASM_ACCOUNT || 'undefined',
    runtime_ASM_BASE_URL: locals?.runtime?.env?.ASM_BASE_URL || 'undefined',
    runtime_ASM_USERNAME: locals?.runtime?.env?.ASM_USERNAME ? 'SET' : 'undefined',
    runtime_ASM_PASSWORD: locals?.runtime?.env?.ASM_PASSWORD ? 'SET' : 'undefined',
  };

  return new Response(JSON.stringify({
    ok: true,
    where: "astro+cloudflare pages functions",
    message: "SSR API routes are working!",
    timestamp: new Date().toISOString(),
    environment: env,
    locals_available: !!locals,
    runtime_available: !!locals?.runtime,
    env_available: !!locals?.runtime?.env
  }, null, 2), {
    headers: { 
      "content-type": "application/json" 
    }
  });
}