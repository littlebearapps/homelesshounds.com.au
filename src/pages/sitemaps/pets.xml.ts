import type { APIRoute } from 'astro';

// Dynamic sitemap for pet listings - updates with fresh data
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Get environment variables
    const env = (locals as any)?.runtime?.env || {};
    const ASM_ACCOUNT = env.ASM_ACCOUNT || import.meta.env.PUBLIC_ASM_ACCOUNT || 'st3418';
    const ASM_BASE_URL = env.ASM_BASE_URL || import.meta.env.PUBLIC_ASM_BASE || 'https://service.sheltermanager.com/asmservice';
    const ASM_USERNAME = env.ASM_USERNAME || import.meta.env.ASM_USERNAME || '';
    const ASM_PASSWORD = env.ASM_PASSWORD || import.meta.env.ASM_PASSWORD || '';

    // Fetch adoptable animals from ASM
    const params = new URLSearchParams({
      account: ASM_ACCOUNT,
      method: 'xml_adoptable_animals',
      username: ASM_USERNAME,
      password: ASM_PASSWORD
    });

    const response = await fetch(`${ASM_BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`ASM API error: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse animals from XML response
    const animals: Array<{
      id: string;
      name: string;
      species: string;
      breed: string;
      lastUpdated: string;
    }> = [];

    // Extract animals using regex (simple XML parsing)
    const animalMatches = xmlText.matchAll(/<row>([\s\S]*?)<\/row>/g);

    for (const match of animalMatches) {
      const animalXml = match[1];

      // Extract fields
      const getId = (xml: string) => {
        const match = xml.match(/<animalid>(\d+)<\/animalid>/);
        return match ? match[1] : '';
      };

      const getName = (xml: string) => {
        const match = xml.match(/<animalname>(.*?)<\/animalname>/);
        return match ? match[1] : '';
      };

      const getSpecies = (xml: string) => {
        const match = xml.match(/<speciesname>(.*?)<\/speciesname>/);
        return match ? match[1].toLowerCase() : '';
      };

      const getBreed = (xml: string) => {
        const match = xml.match(/<breedname>(.*?)<\/breedname>/);
        return match ? match[1] : '';
      };

      const getLastChanged = (xml: string) => {
        const match = xml.match(/<lastchangeddate>(.*?)<\/lastchangeddate>/);
        if (match && match[1]) {
          // Convert date format (DD/MM/YYYY to YYYY-MM-DD)
          const parts = match[1].split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
        return new Date().toISOString().split('T')[0];
      };

      const id = getId(animalXml);
      const name = getName(animalXml);
      const species = getSpecies(animalXml);
      const breed = getBreed(animalXml);

      if (id && name && (species === 'dog' || species === 'cat')) {
        animals.push({
          id,
          name,
          species,
          breed,
          lastUpdated: getLastChanged(animalXml)
        });
      }
    }

    // Helper function to create URL-safe slug
    const createSlug = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
    };

    // Generate sitemap URLs
    const urls = animals.map(animal => {
      const slug = createSlug(`${animal.name} ${animal.breed} ${animal.species}`);
      return `
    <url>
      <loc>https://homelesshounds.com.au/adopt/${animal.species}/${animal.id}/${slug}</loc>
      <lastmod>${animal.lastUpdated}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`;
    }).join('');

    // Create sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating pets sitemap:', error);

    // Return empty sitemap on error
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new Response(emptySitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes on error
      }
    });
  }
};