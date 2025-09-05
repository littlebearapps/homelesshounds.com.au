interface Env {
  ASM_ACCOUNT: string;
  ASM_BASE_URL: string;
  ASM_USERNAME: string;
  ASM_PASSWORD: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const animalId = params.id as string;
  
  if (!animalId) {
    return new Response(JSON.stringify({
      error: 'Animal ID is required'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // Build ASM API URL
  const asmUrl = new URL(env.ASM_BASE_URL);
  asmUrl.searchParams.set('account', env.ASM_ACCOUNT);
  asmUrl.searchParams.set('method', 'json_adoptable_animal'); // Note: singular
  asmUrl.searchParams.set('animalid', animalId);
  asmUrl.searchParams.set('username', env.ASM_USERNAME);
  asmUrl.searchParams.set('password', env.ASM_PASSWORD);
  
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
    
    const data = await response.json();
    
    // ASM returns an array even for single animal
    const animal = Array.isArray(data) && data.length > 0 ? data[0] : null;
    
    if (!animal) {
      return new Response(JSON.stringify({
        animal: null,
        error: 'Animal not found or not adoptable'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Generate image URLs based on WEBSITEIMAGECOUNT
    const images = [];
    const imageCount = animal.WEBSITEIMAGECOUNT || 0;
    for (let seq = 1; seq <= imageCount; seq++) {
      images.push(
        `${env.ASM_BASE_URL}?account=${env.ASM_ACCOUNT}&method=animal_image&animalid=${animalId}&seq=${seq}`
      );
    }
    
    // Return normalized response
    return new Response(JSON.stringify({
      animal: animal,
      images: images,
      thumbnailUrl: `${env.ASM_BASE_URL}?account=${env.ASM_ACCOUNT}&method=animal_thumbnail&animalid=${animalId}`
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600', // 10 minutes
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error fetching animal details:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch animal details',
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