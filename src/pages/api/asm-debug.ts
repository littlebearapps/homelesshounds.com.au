import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any)?.runtime;
  const ASM_ACCOUNT = runtime?.env?.ASM_ACCOUNT || import.meta.env.ASM_ACCOUNT;
  const ASM_BASE_URL = runtime?.env?.ASM_BASE_URL || import.meta.env.ASM_BASE_URL;
  const ASM_USERNAME = runtime?.env?.ASM_USERNAME || import.meta.env.ASM_USERNAME;
  const ASM_PASSWORD = runtime?.env?.ASM_PASSWORD || import.meta.env.ASM_PASSWORD;

  const debugInfo: any = {
    envVarsFound: {
      ASM_ACCOUNT: !!ASM_ACCOUNT,
      ASM_BASE_URL: !!ASM_BASE_URL,
      ASM_USERNAME: !!ASM_USERNAME,
      ASM_PASSWORD: !!ASM_PASSWORD,
    },
    asmApiTest: null,
    error: null,
    fetchError: null,
    responseHeaders: null,
    responseStatus: null,
    responseText: null
  };

  if (!ASM_ACCOUNT || !ASM_BASE_URL || !ASM_USERNAME || !ASM_PASSWORD) {
    debugInfo.error = 'Missing environment variables';
    return new Response(JSON.stringify(debugInfo, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Build ASM API URL - manually construct to avoid double encoding
    const params = new URLSearchParams({
      method: 'json_adoptable_animals',
      account: ASM_ACCOUNT,
      username: ASM_USERNAME,
      password: ASM_PASSWORD,
      speciesid: '1'
    });

    const asmUrl = `${ASM_BASE_URL}?${params.toString()}`;

    // Also try with manual construction
    const manualUrl = `${ASM_BASE_URL}?method=json_adoptable_animals&account=${encodeURIComponent(ASM_ACCOUNT)}&username=${encodeURIComponent(ASM_USERNAME)}&password=${encodeURIComponent(ASM_PASSWORD)}&speciesid=1`;

    debugInfo.requestUrl = asmUrl.replace(ASM_PASSWORD, '***').replace(ASM_USERNAME, '***');
    debugInfo.manualUrl = manualUrl.replace(ASM_PASSWORD, '***').replace(ASM_USERNAME, '***');
    debugInfo.rawPassword = {
      length: ASM_PASSWORD.length,
      hasSpecialChars: /[^a-zA-Z0-9]/.test(ASM_PASSWORD),
      firstChar: ASM_PASSWORD[0],
      lastChar: ASM_PASSWORD[ASM_PASSWORD.length - 1]
    };

    // Try to fetch
    const response = await fetch(asmUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'HomelessHounds-Website/1.0',
        'Accept': 'application/json'
      }
    });

    debugInfo.responseStatus = response.status;
    debugInfo.responseHeaders = Object.fromEntries(response.headers.entries());

    const text = await response.text();
    debugInfo.responseText = text.substring(0, 500); // First 500 chars only

    if (response.ok) {
      try {
        const json = JSON.parse(text);
        debugInfo.asmApiTest = {
          success: true,
          animalCount: Array.isArray(json) ? json.length : 0,
          firstAnimal: Array.isArray(json) && json[0] ? json[0].ANIMALNAME : null
        };
      } catch (e) {
        debugInfo.asmApiTest = {
          success: false,
          parseError: e.message
        };
      }
    } else {
      debugInfo.asmApiTest = {
        success: false,
        httpError: `${response.status} ${response.statusText}`
      };
    }

  } catch (error) {
    debugInfo.fetchError = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      name: error.name
    };
    debugInfo.error = `Fetch failed: ${error.message}`;
  }

  return new Response(JSON.stringify(debugInfo, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
};