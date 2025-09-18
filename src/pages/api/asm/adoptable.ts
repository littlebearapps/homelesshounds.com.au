import type { AdoptableAnimalsResponse, ASMAnimal } from '../../../types/asm';

export const prerender = false;

export const GET = async ({ request, url, locals }) => {
  // Get environment variables from Cloudflare runtime OR local dev environment
  const ASM_ACCOUNT = locals?.runtime?.env?.ASM_ACCOUNT || import.meta.env.ASM_ACCOUNT;
  const ASM_BASE_URL = locals?.runtime?.env?.ASM_BASE_URL || import.meta.env.ASM_BASE_URL;
  const ASM_USERNAME = locals?.runtime?.env?.ASM_USERNAME || import.meta.env.ASM_USERNAME;
  const ASM_PASSWORD = locals?.runtime?.env?.ASM_PASSWORD || import.meta.env.ASM_PASSWORD;

  // Validate environment variables
  if (!ASM_ACCOUNT || !ASM_BASE_URL || !ASM_USERNAME || !ASM_PASSWORD) {
    console.error('Missing ASM environment variables');
    return new Response(JSON.stringify({ 
      error: 'Server configuration error',
      animals: [],
      total: 0,
      hasMore: false,
      offset: 0,
      limit: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse query parameters
    const searchParams = url.searchParams;
    const species = searchParams.get('species') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build ASM API URL - using correct method name from docs
    const asmUrl = new URL(ASM_BASE_URL);
    asmUrl.searchParams.set('method', 'json_adoptable_animals');
    asmUrl.searchParams.set('account', ASM_ACCOUNT);
    asmUrl.searchParams.set('username', ASM_USERNAME);
    asmUrl.searchParams.set('password', ASM_PASSWORD);
    
    // Add species filter if specified
    if (species !== 'all') {
      if (species === 'dog') {
        asmUrl.searchParams.set('speciesid', '1');
      } else if (species === 'cat') {
        asmUrl.searchParams.set('speciesid', '2');
      }
    }

    console.log(`Fetching animals from ASM: species=${species}, limit=${limit}, offset=${offset}`);

    // Fetch from ASM
    const response = await fetch(asmUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'HomelessHounds-Website/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`ASM API returned ${response.status}: ${response.statusText}`);
    }

    // Try to get the response as text first to handle non-JSON errors
    const responseText = await response.text();

    // Check if ASM returned an error message
    if (responseText.startsWith('ERROR:')) {
      console.error('ASM API Error:', responseText);
      throw new Error(responseText);
    }

    // Parse as JSON
    let asmData;
    try {
      asmData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse ASM response:', responseText);
      throw new Error('Invalid response format from ASM API');
    }
    
    // Ensure we have an array
    const animals: ASMAnimal[] = Array.isArray(asmData) ? asmData : [];

    // Apply pagination
    const paginatedAnimals = animals.slice(offset, offset + limit);
    
    // Build response
    const result: AdoptableAnimalsResponse = {
      animals: paginatedAnimals,
      total: animals.length,
      hasMore: animals.length > (offset + limit),
      offset,
      limit
    };

    console.log(`Returning ${paginatedAnimals.length} animals out of ${animals.length} total`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600' // 10 minutes cache
      }
    });

  } catch (error) {
    console.error('Error fetching adoptable animals:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      animals: [],
      total: 0,
      hasMore: false,
      offset: 0,
      limit: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};