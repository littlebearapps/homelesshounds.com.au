interface Env {
  ASM_ACCOUNT: string;
  ASM_BASE_URL: string;
  ASM_USERNAME: string;
  ASM_PASSWORD: string;
}

interface AdoptableParams {
  species?: 'all' | 'dog' | 'cat';
  limit?: number;
  offset?: number;
  agegroup?: string;
  location?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Parse query parameters
  const species = url.searchParams.get('species') || 'all';
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const agegroup = url.searchParams.get('agegroup');
  const location = url.searchParams.get('location');
  
  // Build ASM API URL
  const asmUrl = new URL(env.ASM_BASE_URL);
  asmUrl.searchParams.set('account', env.ASM_ACCOUNT);
  asmUrl.searchParams.set('method', 'json_adoptable_animals');
  asmUrl.searchParams.set('username', env.ASM_USERNAME);
  asmUrl.searchParams.set('password', env.ASM_PASSWORD);
  
  // Add species filter if specified
  if (species === 'dog') {
    asmUrl.searchParams.set('speciesid', '1');
  } else if (species === 'cat') {
    asmUrl.searchParams.set('speciesid', '2');
  }
  
  try {
    // Fetch from ASM with caching
    const response = await fetch(asmUrl.toString(), {
      cf: {
        cacheTtl: 600, // 10 minutes
        cacheEverything: true
      }
    });
    
    if (!response.ok) {
      throw new Error(`ASM API returned ${response.status}`);
    }
    
    const animals = await response.json();
    
    // Apply additional filters if needed
    let filtered = animals;
    
    if (agegroup) {
      filtered = filtered.filter((a: any) => a.AGEGROUP === agegroup);
    }
    
    if (location) {
      filtered = filtered.filter((a: any) => a.SHELTERLOCATIONNAME === location);
    }
    
    // Apply pagination
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    
    // Return normalized response
    return new Response(JSON.stringify({
      animals: paginated,
      total: total,
      hasMore: offset + limit < total,
      offset: offset,
      limit: limit
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600', // 10 minutes
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error fetching adoptable animals:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch adoptable animals',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};