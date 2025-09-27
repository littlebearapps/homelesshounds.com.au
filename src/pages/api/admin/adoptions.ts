import type { APIRoute } from 'astro';

export const prerender = false;

// Admin endpoint to view adoption events and notification stats
export const GET: APIRoute = async (ctx) => {
  const env = (ctx.locals as any)?.runtime?.env || {};
  const db = env.DB as D1Database;

  // Admin authentication
  if (ctx.request.headers.get('x-admin-key') !== env.ADMIN_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get recent adoption events with applicant and notification counts
    const adoptions = await db.prepare(`
      SELECT
        e.animal_id,
        e.animal_name,
        e.species,
        e.adoption_date,
        e.new_owner_email,
        (SELECT COUNT(*)
         FROM applications a
         WHERE a.animal_id = e.animal_id AND a.superseded_at IS NULL) AS applicant_count,
        (SELECT COUNT(*)
         FROM adoption_outcome_notifications n
         WHERE n.animal_id = e.animal_id) AS notifications_sent,
        (SELECT COUNT(*)
         FROM adoption_outcome_notifications n
         WHERE n.animal_id = e.animal_id AND n.status = 'failed') AS notifications_failed,
        CASE WHEN EXISTS (
          SELECT 1 FROM adoption_suppressions s
          WHERE s.animal_id = e.animal_id
        ) THEN 1 ELSE 0 END AS suppressed
      FROM adoption_events e
      ORDER BY e.adoption_date DESC
      LIMIT 100
    `).all();

    // Get form ID usage stats (last 14 days)
    const formStats = await db.prepare(`
      SELECT
        form_id,
        COUNT(*) AS application_count,
        COUNT(DISTINCT animal_id) AS unique_animals
      FROM applications
      WHERE created_at >= datetime('now', '-14 days')
      GROUP BY form_id
      ORDER BY application_count DESC
    `).all();

    // Get notification stats summary
    const notificationStats = await db.prepare(`
      SELECT
        notification_type,
        status,
        COUNT(*) AS count
      FROM adoption_outcome_notifications
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY notification_type, status
    `).all();

    const response = {
      adoptions: adoptions.results || [],
      form_stats: formStats.results || [],
      notification_stats: notificationStats.results || [],
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin adoptions endpoint error:', error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};