/**
 * Newsletter Subscription API
 * Handles newsletter signups via SendGrid
 */

import type { APIRoute } from 'astro';
import { sendGridNewsletter, type NewsletterContact } from '../../../lib/sendgrid-newsletter';
import { validateTurnstile } from '../../../lib/turnstile';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    // Extract form data
    const email = formData.get('email')?.toString().trim();
    const firstName = formData.get('firstName')?.toString().trim();
    const lastName = formData.get('lastName')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const city = formData.get('city')?.toString().trim();
    const state = formData.get('state')?.toString().trim();
    const userType = formData.get('userType')?.toString() as NewsletterContact['userType'] || 'general';
    const interests = formData.getAll('interests').map(i => i.toString());
    const source = formData.get('source')?.toString() || 'website';
    const marketingOptIn = formData.get('marketingOptIn') === 'true';
    const turnstileToken = formData.get('cf-turnstile-response')?.toString();

    // Validate required fields
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email address is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Please provide a valid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Only validate Turnstile if marketing opt-in is true (to prevent spam)
    if (marketingOptIn && turnstileToken) {
      const turnstileValid = await validateTurnstile(turnstileToken);
      if (!turnstileValid) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Security verification failed. Please try again.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Prepare contact data
    const contactData: NewsletterContact = {
      email,
      firstName,
      lastName,
      phone,
      city,
      state,
      userType,
      interests,
      source,
      marketingOptIn,
      subscriptionDate: new Date().toISOString()
    };

    // Add to SendGrid
    const result = await sendGridNewsletter.addContact(contactData);

    if (!result.success) {
      console.error('Newsletter subscription failed:', result.error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to subscribe to newsletter. Please try again later.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Success response
    return new Response(JSON.stringify({
      success: true,
      message: marketingOptIn
        ? 'Successfully subscribed to our newsletter! Check your email for a welcome message.'
        : 'Your information has been saved. You can opt into our newsletter at any time.',
      contactId: result.contactId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};