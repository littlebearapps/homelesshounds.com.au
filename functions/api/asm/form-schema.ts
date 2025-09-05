// GET /api/asm/form-schema?formid={id} - Proxy ASM form JSON with caching
export const onRequestGet: PagesFunction = async ({ env, request }) => {
  const url = new URL(request.url);
  const formid = url.searchParams.get("formid");
  const account = env.ASM_ACCOUNT || env.PUBLIC_ASM_ACCOUNT;
  const baseUrl = env.ASM_BASE_URL || env.PUBLIC_ASM_BASE;
  
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
      method: "GET", 
      // @ts-ignore - cf is Cloudflare-specific
      cf: { 
        cacheTtl: 600, // Cache for 10 minutes
        cacheEverything: true 
      } 
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