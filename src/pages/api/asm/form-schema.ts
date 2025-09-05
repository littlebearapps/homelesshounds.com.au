import type { APIRoute } from 'astro';

// GET /api/asm/form-schema?formid={id} - Proxy ASM form JSON with caching
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const formid = url.searchParams.get("formid");
  
  // Get environment variables
  const account = (locals as any)?.runtime?.env?.ASM_ACCOUNT || import.meta.env.PUBLIC_ASM_ACCOUNT || 'st3418';
  const baseUrl = (locals as any)?.runtime?.env?.ASM_BASE_URL || import.meta.env.PUBLIC_ASM_BASE || 'https://service.sheltermanager.com/asmservice';
  
  if (!account || !formid) {
    return new Response(
      JSON.stringify({ error: "Missing ASM account or form id" }), 
      { 
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      }
    );
  }
  
  // Build ASM URL for form JSON
  const asmUrl = `${baseUrl}?account=${encodeURIComponent(account)}&method=online_form_json&formid=${encodeURIComponent(formid)}`;
  
  try {
    // Fetch from ASM with caching
    const response = await fetch(asmUrl, { 
      method: "GET"
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `ASM returned ${response.status}` }), 
        { 
          status: 502,
          headers: { "content-type": "application/json; charset=utf-8" }
        }
      );
    }
    
    const data = await response.text();
    
    return new Response(data, {
      headers: { 
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, s-maxage=600" // Edge cache for 10 minutes
      }
    });
    
  } catch (error) {
    console.error('Error fetching form schema:', error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch form schema" }), 
      { 
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" }
      }
    );
  }
};

export const prerender = false;