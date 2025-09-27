import type { APIRoute } from 'astro';

export const prerender = false;

// Admin endpoint to manage notification system configurations
export const GET: APIRoute = async (ctx) => {
  const env = (ctx.locals as any)?.runtime?.env || {};
  const db = env.DB as D1Database;

  // Admin authentication
  if (ctx.request.headers.get('x-admin-key') !== env.ADMIN_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get all notification configurations
    const configs = await db.prepare(`
      SELECT * FROM notification_configs
      ORDER BY notification_type
    `).all();

    // Get polling states
    const pollStates = await db.prepare(`
      SELECT * FROM notification_poll_state
      ORDER BY notification_type
    `).all();

    // Get recent activity summary
    const activitySummary = await db.prepare(`
      SELECT
        notification_type,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN test_mode = 1 THEN 1 END) as test_mode_count
      FROM adoption_outcome_notifications
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY notification_type
    `).all();

    const response = {
      configs: configs.results || [],
      poll_states: pollStates.results || [],
      activity_summary: activitySummary.results || [],
      current_mode: env.NOTIFICATION_MODE || 'production',
      test_email: env.TEST_EMAIL_RECIPIENT || 'web@homelesshounds.com.au',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin notification config endpoint error:', error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};

// Update notification configuration
export const POST: APIRoute = async (ctx) => {
  const env = (ctx.locals as any)?.runtime?.env || {};
  const db = env.DB as D1Database;

  // Admin authentication
  if (ctx.request.headers.get('x-admin-key') !== env.ADMIN_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await ctx.request.json() as {
      notification_type: string;
      enabled?: boolean;
      test_mode?: boolean;
      delay_hours?: number;
      template_success_id?: string;
      template_failure_id?: string;
    };

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (typeof body.enabled === 'boolean') {
      updateFields.push('enabled = ?');
      updateValues.push(body.enabled ? 1 : 0);
    }

    if (typeof body.test_mode === 'boolean') {
      updateFields.push('test_mode = ?');
      updateValues.push(body.test_mode ? 1 : 0);
    }

    if (typeof body.delay_hours === 'number') {
      updateFields.push('delay_hours = ?');
      updateValues.push(body.delay_hours);
    }

    if (body.template_success_id) {
      updateFields.push('template_success_id = ?');
      updateValues.push(body.template_success_id);
    }

    if (body.template_failure_id) {
      updateFields.push('template_failure_id = ?');
      updateValues.push(body.template_failure_id);
    }

    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    updateFields.push('updated_at = datetime(\'now\')');
    updateValues.push(body.notification_type);

    const query = `
      UPDATE notification_configs
      SET ${updateFields.join(', ')}
      WHERE notification_type = ?
    `;

    await db.prepare(query).bind(...updateValues).run();

    console.log(`Updated notification config for ${body.notification_type}:`, body);

    return new Response(JSON.stringify({
      success: true,
      notification_type: body.notification_type,
      updated_fields: Object.keys(body).filter(k => k !== 'notification_type')
    }), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin notification config update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update configuration'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};