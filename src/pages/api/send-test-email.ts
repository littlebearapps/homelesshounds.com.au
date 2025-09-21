import type { APIRoute } from 'astro';
import { createEmailService } from '../../lib/email/services/sendgrid.service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Only allow in development
  if (import.meta.env.MODE !== 'development') {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const data = await request.json();
    const { formId, ...formData } = data;

    if (!formId) {
      return new Response(JSON.stringify({ error: 'Form ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Create email service
    const emailService = createEmailService(import.meta.env);

    if (!emailService) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Send emails (admin notification and user confirmation)
    const results = await emailService.sendFormEmails(formId, formData);

    console.log(`Test email sent for form ${formId}:`, {
      admin: results.admin.success ? 'Success' : `Failed: ${results.admin.error}`,
      user: results.user ? (results.user.success ? 'Success' : `Failed: ${results.user.error}`) : 'Not sent (no email)',
    });

    return new Response(JSON.stringify({
      success: true,
      formId,
      results: {
        admin: {
          sent: results.admin.success,
          error: results.admin.error,
          messageId: results.admin.messageId,
        },
        user: results.user ? {
          sent: results.user.success,
          error: results.user.error,
          messageId: results.user.messageId,
        } : null,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};