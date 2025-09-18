import type { APIRoute } from 'astro';
import { createEmailService } from '../../lib/email/services/sendgrid.service';

// POST /api/contact - Contact form submission
const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const form = await request.formData();

    // Get environment variables
    const env = (locals as any)?.runtime?.env || {};
    const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;

    // --- Turnstile verification (optional) ---
    const token = form.get("cf-turnstile-response");

    // Only verify Turnstile if secret key is configured and token provided
    if (TURNSTILE_SECRET_KEY && TURNSTILE_SECRET_KEY !== '' && token) {
      const ip = request.headers.get("CF-Connecting-IP") || "";

      const verifyRes = await fetch(TURNSTILE_VERIFY, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: String(token),
          remoteip: ip
        })
      });

      const verify = await verifyRes.json() as { success: boolean };
      if (!verify.success) {
        return new Response("Turnstile verification failed", { status: 403 });
      }
    }

    // Extract form data
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const email = form.get("email") as string;
    const phone = form.get("phone") as string;
    const purpose = form.get("purpose") as string;
    const message = form.get("message") as string;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !purpose || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response("Invalid email address", { status: 400 });
    }

    // Get full environment variables for email service
    const fullEnv = {
      ...env,
      ...import.meta.env,
      SENDGRID_API_KEY: env.SENDGRID_API_KEY || import.meta.env.SENDGRID_API_KEY,
      SENDGRID_FROM_EMAIL: env.SENDGRID_FROM_EMAIL || import.meta.env.SENDGRID_FROM_EMAIL,
      SENDGRID_FROM_NAME: env.SENDGRID_FROM_NAME || import.meta.env.SENDGRID_FROM_NAME,
      EMAIL_CONTACT_FORM: env.EMAIL_CONTACT_FORM || import.meta.env.EMAIL_CONTACT_FORM,
      EMAIL_ADMIN_DEFAULT: env.EMAIL_ADMIN_DEFAULT || import.meta.env.EMAIL_ADMIN_DEFAULT,
    };

    const emailService = createEmailService(fullEnv);

    if (!emailService) {
      console.error('Email service not configured for contact form');
      return new Response("Email service not available", { status: 500 });
    }

    // Prepare contact form data
    const contactData = {
      firstName,
      lastName,
      email,
      phone,
      purpose,
      message,
      submittedAt: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })
    };

    try {
      // Send notification email to admin
      const adminEmail = fullEnv.EMAIL_CONTACT_FORM || fullEnv.EMAIL_ADMIN_DEFAULT;

      if (!adminEmail) {
        console.error('No contact form admin email configured');
        return new Response("Contact form not properly configured", { status: 500 });
      }

      const adminEmailData = {
        to: adminEmail,
        from: {
          email: fullEnv.SENDGRID_FROM_EMAIL,
          name: fullEnv.SENDGRID_FROM_NAME || 'Homeless Hounds'
        },
        subject: `Contact Form: ${purpose} - ${firstName} ${lastName}`,
        html: `
          <h2>New Contact Form Submission</h2>

          <h3>Contact Details</h3>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Purpose:</strong> ${purpose}</p>
          <p><strong>Submitted:</strong> ${contactData.submittedAt}</p>

          <h3>Message</h3>
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #8b5cf6; margin: 15px 0;">
            ${message.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            <em>This email was sent automatically from the Homeless Hounds contact form.</em><br>
            Reply directly to this email to respond to ${firstName}.
          </p>
        `,
        text: `
New Contact Form Submission

Contact Details:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Purpose: ${purpose}
Submitted: ${contactData.submittedAt}

Message:
${message}

---
This email was sent automatically from the Homeless Hounds contact form.
Reply directly to this email to respond to ${firstName}.
        `,
        replyTo: email
      };

      // Use the sendWithRetry method correctly - accessing the private method through reflection
      const adminResult = await (emailService as any).sendWithRetry(adminEmailData);

      // Send confirmation email to user
      const userEmailData = {
        to: email,
        from: {
          email: fullEnv.SENDGRID_FROM_EMAIL,
          name: fullEnv.SENDGRID_FROM_NAME || 'Homeless Hounds'
        },
        subject: 'Thank you for contacting Homeless Hounds',
        html: `
          <h2>Thank you for reaching out!</h2>

          <p>Hi ${firstName},</p>

          <p>Thank you for contacting Homeless Hounds. We've received your ${purpose.toLowerCase()} and will respond within 48 hours during business hours.</p>

          <h3>Your Message Summary</h3>
          <p><strong>Purpose:</strong> ${purpose}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Submitted:</strong> ${contactData.submittedAt}</p>

          <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
            <p><strong>Your message:</strong></p>
            ${message.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>

          <h3>What happens next?</h3>
          <ul>
            <li>We'll review your enquiry and respond within 48 hours</li>
            <li>For urgent matters, we aim to respond within 24 hours</li>
            <li>Please check your spam folder if you don't hear from us</li>
          </ul>

          <p>If you have any urgent concerns about animal welfare, please contact your local council, RSPCA, or police directly.</p>

          <p>Thank you for supporting our mission to help animals in need.</p>

          <p>Best regards,<br>
          The Homeless Hounds Team</p>

          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            <strong>Homeless Hounds Animal Rescue Inc.</strong><br>
            ABN 93 136 291 221<br>
            Email: info@homelesshounds.com.au<br>
            Website: homelesshounds.com.au
          </p>
        `,
        text: `
Thank you for reaching out!

Hi ${firstName},

Thank you for contacting Homeless Hounds. We've received your ${purpose.toLowerCase()} and will respond within 48 hours during business hours.

Your Message Summary:
Purpose: ${purpose}
Phone: ${phone}
Submitted: ${contactData.submittedAt}

Your message:
${message}

What happens next?
- We'll review your enquiry and respond within 48 hours
- For urgent matters, we aim to respond within 24 hours
- Please check your spam folder if you don't hear from us

If you have any urgent concerns about animal welfare, please contact your local council, RSPCA, or police directly.

Thank you for supporting our mission to help animals in need.

Best regards,
The Homeless Hounds Team

---
Homeless Hounds Animal Rescue Inc.
ABN 93 136 291 221
Email: info@homelesshounds.com.au
Website: homelesshounds.com.au
        `
      };

      const userResult = await (emailService as any).sendWithRetry(userEmailData);

      // Log results
      console.log(`Contact form submission from ${firstName} ${lastName}:`, {
        admin: adminResult.success ? 'sent' : `failed: ${adminResult.error}`,
        user: userResult.success ? 'sent' : `failed: ${userResult.error}`
      });

      // Return success response
      return Response.redirect("/contact-us/thanks", 303);

    } catch (emailError) {
      console.error('Failed to send contact form emails:', emailError);
      return new Response("Failed to send confirmation emails", { status: 500 });
    }

  } catch (error) {
    console.error('Contact form submission error:', error);
    return new Response("An error occurred. Please try again.", { status: 500 });
  }
};

export const prerender = false;

// Export as default for compatibility
export default {
  POST
};