/**
 * SendGrid Event Webhook Endpoint
 * Receives real-time notifications about email events (delivered, bounced, opened, etc.)
 */

import type { APIRoute } from 'astro';

// Event types from SendGrid
interface SendGridEvent {
  email: string;
  timestamp: number;
  event: 'processed' | 'delivered' | 'opened' | 'clicked' | 'bounce' | 'dropped' | 'deferred' | 'spam_report' | 'unsubscribe' | 'group_unsubscribe' | 'group_resubscribe';
  sg_event_id?: string;
  sg_message_id?: string;
  useragent?: string;
  ip?: string;
  url?: string;
  reason?: string;
  status?: string;
  response?: string;
  attempt?: string;
  category?: string[];
  type?: string;
  asm_group_id?: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📧 SendGrid webhook received');

    // Get headers for signature verification
    const signature = request.headers.get('X-Twilio-Email-Event-Webhook-Signature');
    const timestamp = request.headers.get('X-Twilio-Email-Event-Webhook-Timestamp');

    // Get raw body
    const rawBody = await request.text();

    // Verify webhook signature for security
    const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
    if (publicKey && signature && timestamp) {
      const { EventWebhook } = await import('@sendgrid/eventwebhook');
      const eventWebhook = new EventWebhook();

      try {
        const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey);
        const isValid = eventWebhook.verifySignature(ecPublicKey, rawBody, signature, timestamp);

        if (!isValid) {
          console.error('❌ Invalid webhook signature');
          return new Response('Unauthorized', { status: 403 });
        }

        console.log('🔐 Webhook signature verified');
      } catch (verifyError) {
        console.error('❌ Signature verification error:', verifyError);
        return new Response('Unauthorized', { status: 403 });
      }
    } else {
      console.warn('⚠️ Webhook signature verification skipped - missing public key or headers');
    }

    // Parse events
    let events: SendGridEvent[];
    try {
      events = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Failed to parse webhook body:', parseError);
      return new Response('Invalid JSON', { status: 400 });
    }

    // Process each event
    for (const event of events) {
      await processEmailEvent(event);
    }

    console.log(`✅ Processed ${events.length} email events`);
    return new Response(null, { status: 204 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

async function processEmailEvent(event: SendGridEvent) {
  const { email, event: eventType, timestamp, sg_message_id } = event;
  const eventTime = new Date(timestamp * 1000).toISOString();

  console.log(`📊 Email Event: ${eventType} | ${email} | ${eventTime}`);

  // Define critical events that need immediate admin attention
  const criticalEvents = ['bounce', 'dropped', 'spam_report'];
  const needsAlert = criticalEvents.includes(eventType);

  switch (eventType) {
    case 'delivered':
      console.log('✅ Email delivered successfully to:', email);
      break;

    case 'bounce':
      console.warn('⚠️ Email bounced:', {
        email,
        reason: event.reason,
        status: event.status,
        type: event.type
      });

      if (needsAlert) {
        await sendAdminAlert('Email Bounce Alert', `
          <h3>Email Bounced</h3>
          <p><strong>Recipient:</strong> ${email}</p>
          <p><strong>Reason:</strong> ${event.reason || 'Unknown'}</p>
          <p><strong>Status:</strong> ${event.status || 'Unknown'}</p>
          <p><strong>Type:</strong> ${event.type || 'Unknown'}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          <p><strong>Message ID:</strong> ${sg_message_id || 'Unknown'}</p>
        `);
      }
      break;

    case 'dropped':
      console.warn('🚫 Email dropped by SendGrid:', {
        email,
        reason: event.reason
      });

      if (needsAlert) {
        await sendAdminAlert('Email Dropped Alert', `
          <h3>Email Dropped by SendGrid</h3>
          <p><strong>Recipient:</strong> ${email}</p>
          <p><strong>Reason:</strong> ${event.reason || 'Unknown'}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          <p><strong>Message ID:</strong> ${sg_message_id || 'Unknown'}</p>
          <p><em>This may indicate a delivery issue that needs attention.</em></p>
        `);
      }
      break;

    case 'spam_report':
      console.warn('🚨 Email marked as spam by:', email);

      if (needsAlert) {
        await sendAdminAlert('URGENT: Spam Report Alert', `
          <h3>🚨 Email Marked as Spam</h3>
          <p><strong>Recipient:</strong> ${email}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          <p><strong>Message ID:</strong> ${sg_message_id || 'Unknown'}</p>
          <p style="color: red;"><strong>Action Required:</strong> This may affect your sender reputation. Consider reviewing email content and removing this recipient from future mailings.</p>
        `);
      }
      break;

    case 'unsubscribe':
      console.log('👋 User unsubscribed:', email);
      // Note: Unsubscribes are normal, don't alert for these
      break;

    case 'opened':
      console.log('👁️ Email opened by:', email);
      break;

    case 'clicked':
      console.log('🖱️ Link clicked in email:', {
        email,
        url: event.url
      });
      break;

    case 'processed':
      console.log('⚙️ Email accepted by SendGrid:', email);
      break;

    case 'deferred':
      console.warn('⏳ Email temporarily deferred:', {
        email,
        reason: event.reason,
        attempt: event.attempt
      });
      // Deferrals are temporary, only alert if it becomes a pattern
      break;

    default:
      console.log('ℹ️ Other email event:', eventType, email);
  }
}

async function sendAdminAlert(subject: string, htmlContent: string) {
  try {
    // Import SendGrid service
    const { sendEmail } = await import('../../lib/email/services/sendgrid.service.js');

    // Get admin email from environment (fallback to default)
    const adminEmail = process.env.EMAIL_ADMIN_DEFAULT || 'web@homelesshounds.com.au';

    await sendEmail({
      to: adminEmail,
      from: 'noreply@homelesshounds.com.au',
      subject: `[Homeless Hounds] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">Homeless Hounds Email Alert</h2>
          ${htmlContent}
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated alert from your email delivery system.
            <br>Time: ${new Date().toISOString()}
          </p>
        </div>
      `,
      text: subject // Simplified text version
    });

    console.log('✅ Admin alert sent successfully');
  } catch (error) {
    console.error('❌ Failed to send admin alert:', error);
    // Don't throw - we don't want webhook to fail if alert fails
  }
}

// Health check endpoint
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'sendgrid-webhook',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};