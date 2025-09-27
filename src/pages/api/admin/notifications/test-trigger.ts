import type { APIRoute } from 'astro';

export const prerender = false;

// Admin endpoint to manually trigger test notifications
export const POST: APIRoute = async (ctx) => {
  const env = (ctx.locals as any)?.runtime?.env || {};
  const db = env.DB as D1Database;

  // Admin authentication
  if (ctx.request.headers.get('x-admin-key') !== env.ADMIN_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await ctx.request.json() as {
      animal_id: string;
      notification_type?: string;
      action: 'set_trigger' | 'clear_trigger' | 'force_test';
    };

    const { animal_id, notification_type = 'adoption_outcome', action } = body;

    if (!animal_id) {
      return new Response(JSON.stringify({ error: 'animal_id required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Get notification config
    const config = await db.prepare(
      `SELECT * FROM notification_configs WHERE notification_type = ?`
    ).bind(notification_type).first<any>();

    if (!config) {
      return new Response(JSON.stringify({ error: 'Notification type not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    const testTriggerValue = env.TEST_TRIGGER_VALUE || 'TEST_ADOPTION_NOTIFICATION';
    let result: any = {};

    switch (action) {
      case 'set_trigger':
        // This would require ASM API write access - for now, provide instructions
        result = {
          action: 'set_trigger',
          instructions: [
            `1. Go to ASM admin panel`,
            `2. Find animal ID: ${animal_id}`,
            `3. Edit the animal record`,
            `4. Set the "${config.asm_trigger_field}" field to: "${testTriggerValue}"`,
            `5. Save the record`,
            `6. Wait for next cron run (up to 10 minutes)`,
            `7. Check admin notifications panel for test results`
          ],
          trigger_field: config.asm_trigger_field,
          trigger_value: testTriggerValue,
          animal_id: animal_id
        };
        break;

      case 'clear_trigger':
        result = {
          action: 'clear_trigger',
          instructions: [
            `1. Go to ASM admin panel`,
            `2. Find animal ID: ${animal_id}`,
            `3. Edit the animal record`,
            `4. Clear the "${config.asm_trigger_field}" field (set to empty or original value)`,
            `5. Save the record`
          ],
          trigger_field: config.asm_trigger_field,
          animal_id: animal_id
        };
        break;

      case 'force_test':
        // Create a synthetic test event directly
        const now = new Date().toISOString().replace('T', ' ').replace('Z', '');
        const testKey = `test_${animal_id}_${Date.now()}`;

        // Create test adoption event
        await db.prepare(
          `INSERT INTO adoption_events
           (adoption_key, animal_id, animal_name, species, adoption_date, new_owner_email, raw)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          testKey,
          animal_id,
          'Test Animal',
          'Dog',
          now,
          'test-adopter@example.com',
          JSON.stringify({ test_mode: true, forced_test: true })
        ).run();

        // Check for existing applications
        const applications = await db.prepare(
          `SELECT COUNT(*) as count FROM applications WHERE animal_id = ? AND superseded_at IS NULL`
        ).bind(animal_id).first<{ count: number }>();

        result = {
          action: 'force_test',
          test_event_created: true,
          test_adoption_key: testKey,
          animal_id: animal_id,
          existing_applications: applications?.count || 0,
          instructions: [
            'Test adoption event created successfully',
            `${applications?.count || 0} existing applications found for this animal`,
            'Test notifications will be processed on next cron run',
            'All test emails will be sent to the configured test email address',
            'Check the admin notifications panel in a few minutes for results'
          ]
        };
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
    }

    console.log(`Test trigger action: ${action} for animal ${animal_id}`, result);

    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('Test trigger endpoint error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process test trigger'
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};