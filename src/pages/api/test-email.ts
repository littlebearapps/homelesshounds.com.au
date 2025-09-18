import type { APIRoute } from 'astro';
import { createEmailService } from '../../lib/email/services/sendgrid.service';

export const POST: APIRoute = async ({ request }) => {
  // Only allow in development
  if (import.meta.env.MODE !== 'development') {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    // Get all environment variables
    const env = {
      ...import.meta.env,
      SENDGRID_API_KEY: import.meta.env.SENDGRID_API_KEY,
      SENDGRID_FROM_EMAIL: import.meta.env.SENDGRID_FROM_EMAIL,
      SENDGRID_FROM_NAME: import.meta.env.SENDGRID_FROM_NAME,
      EMAIL_DOG_ADOPTIONS: import.meta.env.EMAIL_DOG_ADOPTIONS,
      EMAIL_CAT_ADOPTIONS: import.meta.env.EMAIL_CAT_ADOPTIONS,
      EMAIL_SURRENDER_APPLICATIONS: import.meta.env.EMAIL_SURRENDER_APPLICATIONS,
      EMAIL_ADMIN_DEFAULT: import.meta.env.EMAIL_ADMIN_DEFAULT,
    };

    const emailService = createEmailService(env);

    if (!emailService) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email service not configured properly. Check environment variables.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle different test types
    if (body.type === 'surrender' || body.type === 'adoption') {
      // Test form emails
      const results = await emailService.sendFormEmails(body.formId, body.data);

      return new Response(JSON.stringify({
        success: true,
        admin: results.admin.success,
        user: results.user?.success || false,
        details: {
          admin: results.admin,
          user: results.user
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Simple test email
      const result = await emailService.sendTestEmail(body.to || 'web@homelesshounds.com.au');

      return new Response(JSON.stringify({
        success: result.success,
        error: result.error,
        messageId: result.messageId
      }), {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Test email error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;