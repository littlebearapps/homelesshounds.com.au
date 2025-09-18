import type { AnimalDetailResponse, ASMAnimal } from '../../../../types/asm';

export const prerender = false;

export const GET = async ({ params, request, locals }) => {
  const { id } = params;

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
      animal: null,
      images: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({
      error: 'Invalid animal ID',
      animal: null,
      images: []
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log(`Fetching animal details for ID: ${id}`);

    // Build ASM API URL - using correct method name from docs
    const asmUrl = new URL(ASM_BASE_URL);
    asmUrl.searchParams.set('method', 'json_adoptable_animal');
    asmUrl.searchParams.set('account', ASM_ACCOUNT);
    asmUrl.searchParams.set('username', ASM_USERNAME);
    asmUrl.searchParams.set('password', ASM_PASSWORD);
    asmUrl.searchParams.set('animalid', id);

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

    const asmData = await response.json();
    
    // Check if animal exists and is adoptable
    const animal: ASMAnimal | null = Array.isArray(asmData) && asmData.length > 0 ? asmData[0] : null;
    
    if (!animal) {
      return new Response(JSON.stringify({
        error: 'Animal not found or not available for adoption',
        animal: null,
        images: []
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate image URLs
    const images: string[] = [];
    const thumbnailUrl = `https://service.sheltermanager.com/asmservice?account=${ASM_ACCOUNT}&method=animal_thumbnail&animalid=${animal.ID}`;
    
    // Add main thumbnail
    images.push(thumbnailUrl);
    
    // Add additional images if available
    const imageCount = animal.WEBSITEIMAGECOUNT || 0;
    for (let i = 2; i <= imageCount; i++) {
      images.push(
        `https://service.sheltermanager.com/asmservice?account=${ASM_ACCOUNT}&method=animal_image&animalid=${animal.ID}&seq=${i}`
      );
    }

    // Build response
    const result: AnimalDetailResponse = {
      animal,
      images,
      thumbnailUrl
    };

    console.log(`Returning details for ${animal.ANIMALNAME} with ${images.length} images`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600' // 10 minutes cache
      }
    });

  } catch (error) {
    console.error('Error fetching animal details:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      animal: null,
      images: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};