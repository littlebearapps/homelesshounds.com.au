import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  // Check environment variables in different locations
  const runtime = (locals as any)?.runtime;

  const checks = {
    // Check runtime.env
    runtime_exists: !!runtime,
    runtime_env_exists: !!runtime?.env,

    // Check for ASM variables in runtime.env
    runtime_ASM_ACCOUNT: runtime?.env?.ASM_ACCOUNT ? 'set' : 'missing',
    runtime_ASM_BASE_URL: runtime?.env?.ASM_BASE_URL ? 'set' : 'missing',
    runtime_ASM_USERNAME: runtime?.env?.ASM_USERNAME ? 'set' : 'missing',
    runtime_ASM_PASSWORD: runtime?.env?.ASM_PASSWORD ? 'set' : 'missing',

    // Check import.meta.env
    meta_ASM_ACCOUNT: import.meta.env.ASM_ACCOUNT ? 'set' : 'missing',
    meta_ASM_BASE_URL: import.meta.env.ASM_BASE_URL ? 'set' : 'missing',
    meta_ASM_USERNAME: import.meta.env.ASM_USERNAME ? 'set' : 'missing',
    meta_ASM_PASSWORD: import.meta.env.ASM_PASSWORD ? 'set' : 'missing',

    // Check process.env
    process_ASM_ACCOUNT: process.env.ASM_ACCOUNT ? 'set' : 'missing',
    process_ASM_BASE_URL: process.env.ASM_BASE_URL ? 'set' : 'missing',
    process_ASM_USERNAME: process.env.ASM_USERNAME ? 'set' : 'missing',
    process_ASM_PASSWORD: process.env.ASM_PASSWORD ? 'set' : 'missing',

    // Check for public variables
    runtime_PUBLIC_ASM_ACCOUNT: runtime?.env?.PUBLIC_ASM_ACCOUNT || 'missing',
    runtime_PUBLIC_ASM_BASE: runtime?.env?.PUBLIC_ASM_BASE || 'missing',
    meta_PUBLIC_ASM_ACCOUNT: import.meta.env.PUBLIC_ASM_ACCOUNT || 'missing',
    meta_PUBLIC_ASM_BASE: import.meta.env.PUBLIC_ASM_BASE || 'missing',

    // Platform info
    platform: runtime?.platform || 'unknown',
    context_keys: runtime?.env ? Object.keys(runtime.env).filter(k => k.includes('ASM') || k.includes('SENDGRID')).join(', ') : 'no runtime.env'
  };

  return new Response(JSON.stringify(checks, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
};