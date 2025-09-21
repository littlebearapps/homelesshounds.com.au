import type { APIRoute } from 'astro';
import { createEmailService } from '../../lib/email/services/sendgrid.service';
import { sendGridNewsletter, type NewsletterContact } from '../../lib/sendgrid-newsletter';

// POST /api/submit - Single endpoint for all form submissions
const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOTAL = 10 * 1024 * 1024; // 10MB total (Cloudflare limit)
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const form = await request.formData();

    // Get environment variables
    const env = (locals as any)?.runtime?.env || {};
    const TURNSTILE_SECRET_KEY = env.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;

    // --- Turnstile verification ---
    const token = form.get("cf-turnstile-response");
    
    // Only verify Turnstile if secret key is configured
    if (TURNSTILE_SECRET_KEY && TURNSTILE_SECRET_KEY !== '') {
      if (!token) {
        return new Response("Turnstile token missing", { status: 400 });
      }
      
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

    // --- Validate files + total size ---
    let total = 0;
    for (const [name, value] of form.entries()) {
      if (value instanceof File) {
        total += value.size || 0;
        if (total > MAX_TOTAL) {
          return new Response("Files too large (max 10MB total)", { status: 413 });
        }
        if (!ALLOWED.has(value.type)) {
          return new Response(`Invalid file type for ${name}`, { status: 400 });
        }
      }
    }

    // --- Forward to ASM ---
    const account = env.ASM_ACCOUNT || import.meta.env.PUBLIC_ASM_ACCOUNT || 'st3418';
    const baseUrl = env.ASM_BASE_URL || import.meta.env.PUBLIC_ASM_BASE || 'https://service.sheltermanager.com/asmservice';
    const formid = String(form.get("formid"));
    
    if (!account || !formid) {
      return new Response("Missing ASM configuration or form ID", { status: 400 });
    }

    // Remove Turnstile token before forwarding to ASM (if present)
    if (form.has("cf-turnstile-response")) {
      form.delete("cf-turnstile-response");
    }
    
    const asmUrl = `${baseUrl}?account=${encodeURIComponent(account)}&method=online_form_html&formid=${encodeURIComponent(formid)}`;
    
    const asmRes = await fetch(asmUrl, { 
      method: "POST", 
      body: form 
    });
    
    // Handle redirect responses from ASM
    if (asmRes.status >= 300 && asmRes.status < 400) {
      const location = asmRes.headers.get("location");

      // Successful submission - handle both email notifications AND newsletter signup
      try {
        // Get all environment variables including email config
        const fullEnv = {
          ...env,
          ...import.meta.env,
          // Ensure we have all email config from both sources
          SENDGRID_API_KEY: env.SENDGRID_API_KEY || import.meta.env.SENDGRID_API_KEY,
          SENDGRID_FROM_EMAIL: env.SENDGRID_FROM_EMAIL || import.meta.env.SENDGRID_FROM_EMAIL,
          SENDGRID_FROM_NAME: env.SENDGRID_FROM_NAME || import.meta.env.SENDGRID_FROM_NAME,
          EMAIL_DOG_ADOPTIONS: env.EMAIL_DOG_ADOPTIONS || import.meta.env.EMAIL_DOG_ADOPTIONS,
          EMAIL_CAT_ADOPTIONS: env.EMAIL_CAT_ADOPTIONS || import.meta.env.EMAIL_CAT_ADOPTIONS,
          EMAIL_SURRENDER_APPLICATIONS: env.EMAIL_SURRENDER_APPLICATIONS || import.meta.env.EMAIL_SURRENDER_APPLICATIONS,
          EMAIL_ADMIN_DEFAULT: env.EMAIL_ADMIN_DEFAULT || import.meta.env.EMAIL_ADMIN_DEFAULT,
        };

        // Convert FormData to plain object for processing
        const formDataObj: any = {};
        for (const [key, value] of form.entries()) {
          // Skip files for processing
          if (!(value instanceof File)) {
            formDataObj[key] = value;
          }
        }

        // Newsletter subscription handling (before sending notification emails)
        const email = formDataObj.email;
        const marketingOptIn = formDataObj.newsletter_signup === 'true' || formDataObj.marketing_opt_in === 'true';

        if (email && email.includes('@')) {
          // Determine user type and contact reason based on form ID
          let userType: NewsletterContact['userType'] = 'general';
          let contactReason = 'website contact';

          if (formid === "36") {
            userType = 'volunteer';
            contactReason = 'volunteer application';
          } else if (formid === "37") {
            userType = 'general';
            contactReason = 'animal surrender';
          } else if (formid === "38") {
            userType = 'general';
            contactReason = 'general inquiry';
          } else if (formid === "39") {
            userType = 'adopter';
            contactReason = 'adoption application';
          }

          const newsletterContact: NewsletterContact = {
            email: email,
            firstName: formDataObj.firstname || formDataObj.first_name || '',
            lastName: formDataObj.lastname || formDataObj.last_name || '',
            phone: formDataObj.phone || formDataObj.mobile || '',
            city: formDataObj.city || '',
            state: formDataObj.state || '',
            userType,
            source: `form_${formid}`,
            marketingOptIn,
            contactReason,
            subscriptionDate: new Date().toISOString()
          };

          // Add to SendGrid newsletter system asynchronously
          sendGridNewsletter.addContact(newsletterContact).then(result => {
            if (result.success) {
              console.log(`Newsletter contact added for ${email}: ${userType} (marketing: ${marketingOptIn})`);
            } else {
              console.error(`Newsletter signup failed for ${email}:`, result.error);
            }
          }).catch(error => {
            console.error('Newsletter signup error:', error);
          });
        }

        // Send notification emails
        const emailService = createEmailService(fullEnv);

        if (emailService) {
          // Send emails asynchronously (don't block the redirect)
          emailService.sendFormEmails(formid, formDataObj).then(results => {
            console.log(`Email results for form ${formid}:`, {
              admin: results.admin.success ? 'sent' : `failed: ${results.admin.error}`,
              user: results.user ? (results.user.success ? 'sent' : `failed: ${results.user.error}`) : 'not sent (no email)'
            });
          }).catch(error => {
            console.error('Failed to send emails:', error);
          });
        } else {
          console.warn('Email service not configured - skipping notifications');
        }
      } catch (emailError) {
        // Log but don't fail the form submission
        console.error('Email/newsletter setup error:', emailError);
      }

      // Determine thank you page based on form ID
      let thankYouPage = "/contact-us/thanks";
      if (formid === "36") {
        thankYouPage = "/contact-us/volunteer/thanks";
      } else if (formid === "37") {
        thankYouPage = "/contact-us/surrender/thanks";
      } else if (formid === "38") {
        // TODO: Form 38 is currently unassigned - update when new form is added
        thankYouPage = "/contact-us/thanks";
      } else if (formid === "39") {
        thankYouPage = "/adopt/thanks";  // Adoption application
      }

      return Response.redirect(location || thankYouPage, 303);
    }
    
    // Return ASM's response (could be error HTML)
    const html = await asmRes.text();
    return new Response(html, { 
      headers: { "content-type": "text/html; charset=utf-8" }, 
      status: asmRes.status 
    });

  } catch (error) {
    console.error('Submission error:', error);
    return new Response("An error occurred during submission. Please try again.", { status: 500 });
  }
};

export const prerender = false;

// Also export as default for compatibility
export default {
  POST
};