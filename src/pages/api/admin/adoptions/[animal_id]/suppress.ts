import type { APIRoute } from 'astro';

export const prerender = false;

// Admin endpoint to suppress/unsuppress notifications for a specific animal
export const POST: APIRoute = async (ctx) => {
  const env = (ctx.locals as any)?.runtime?.env || {};
  const db = env.DB as D1Database;
  const animalId = ctx.params.animal_id!;

  // Admin authentication
  if (ctx.request.headers.get('x-admin-key') !== env.ADMIN_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await ctx.request.json() as {
      suppressed: boolean;
      reason?: string;
    };

    const { suppressed, reason } = body;

    if (suppressed) {
      // Add suppression
      await db.prepare(`
        INSERT OR REPLACE INTO adoption_suppressions (animal_id, reason)
        VALUES (?, ?)
      `).bind(animalId, reason || 'Manual admin suppression').run();

      console.log(`Suppressed notifications for animal ${animalId}: ${reason || 'Manual admin suppression'}`);
    } else {
      // Remove suppression
      await db.prepare(`
        DELETE FROM adoption_suppressions WHERE animal_id = ?
      `).bind(animalId).run();

      console.log(`Unsuppressed notifications for animal ${animalId}`);
    }

    return new Response(JSON.stringify({
      success: true,
      animal_id: animalId,
      suppressed,
      reason: reason || null
    }), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin suppress endpoint error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update suppression status'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};