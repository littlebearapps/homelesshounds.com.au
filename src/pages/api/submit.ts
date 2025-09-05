import type { APIRoute } from 'astro';

// POST /api/submit - Single endpoint for all form submissions
const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOTAL = 10 * 1024 * 1024; // 10MB total (Cloudflare limit)
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const form = await request.formData();

    // Get environment variables
    const env = (locals as any)?.runtime?.env || {};
    const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;

    // --- Turnstile verification ---
    const token = form.get("cf-turnstile-response");
    if (!token) {
      return new Response("Turnstile token missing", { status: 400 });
    }
    
    const ip = request.headers.get("CF-Connecting-IP") || "";
    
    const verifyRes = await fetch(TURNSTILE_VERIFY, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: String(token),
        remoteip: ip
      })
    });
    
    const verify = await verifyRes.json() as { success: boolean };
    if (!verify.success) {
      return new Response("Turnstile verification failed", { status: 403 });
    }

    // --- Validate files + total size ---
    let total = 0;
    for (const [name, value] of form.entries()) {
      if (value instanceof File) {
        total += value.size || 0;
        if (total > MAX_TOTAL) {
          return new Response("Files too large (max 10MB total)", { status: 413 });
        }
        if (!ALLOWED.has(value.type)) {
          return new Response(`Invalid file type for ${name}`, { status: 400 });
        }
      }
    }

    // --- Forward to ASM ---
    const account = env.ASM_ACCOUNT || import.meta.env.PUBLIC_ASM_ACCOUNT || 'st3418';
    const baseUrl = env.ASM_BASE_URL || import.meta.env.PUBLIC_ASM_BASE || 'https://service.sheltermanager.com/asmservice';
    const formid = String(form.get("formid"));
    
    if (!account || !formid) {
      return new Response("Missing ASM configuration or form ID", { status: 400 });
    }

    // Remove Turnstile token before forwarding to ASM
    form.delete("cf-turnstile-response");
    
    const asmUrl = `${baseUrl}?account=${encodeURIComponent(account)}&method=online_form_html&formid=${encodeURIComponent(formid)}`;
    
    const asmRes = await fetch(asmUrl, { 
      method: "POST", 
      body: form 
    });
    
    // Handle redirect responses from ASM
    if (asmRes.status >= 300 && asmRes.status < 400) {
      const location = asmRes.headers.get("location");
      
      // Determine thank you page based on form ID
      let thankYouPage = "/contact-us/thanks";
      if (formid === "36") {
        thankYouPage = "/contact-us/surrender/thanks";
      } else if (formid === "37") {
        thankYouPage = "/contact-us/adoption/thanks";
      } else if (formid === "38") {
        thankYouPage = "/contact-us/volunteer/thanks";
      } else if (formid === "39") {
        thankYouPage = "/contact-us/foster/thanks";
      }
      
      return Response.redirect(location || thankYouPage, 303);
    }
    
    // Return ASM's response (could be error HTML)
    const html = await asmRes.text();
    return new Response(html, { 
      headers: { "content-type": "text/html; charset=utf-8" }, 
      status: asmRes.status 
    });

  } catch (error) {
    console.error('Submission error:', error);
    return new Response("An error occurred during submission. Please try again.", { status: 500 });
  }
};

export const prerender = false;