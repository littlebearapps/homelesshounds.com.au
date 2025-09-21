/**
 * Newsletter Unsubscribe API
 * Handles newsletter unsubscribe requests via SendGrid
 */

import type { APIRoute } from 'astro';
import { sendGridNewsletter } from '../../../lib/sendgrid-newsletter';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim();

    // Validate email
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

    // Unsubscribe from SendGrid
    const result = await sendGridNewsletter.unsubscribeContact(email);

    if (!result.success) {
      // Even if unsubscribe fails, we don't want to show an error to the user
      // as they might already be unsubscribed or the email might not exist
      console.error('Newsletter unsubscribe error:', result.error);
    }

    // Always return success to avoid exposing email existence
    return new Response(JSON.stringify({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);

    // Always return success for unsubscribe to avoid exposing system errors
    return new Response(JSON.stringify({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('Email parameter is required', { status: 400 });
  }

  // Create unsubscribe form page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribe - Homeless Hounds</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 min-h-screen flex items-center justify-center">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Unsubscribe</h1>
          <p class="text-gray-600">We're sorry to see you go!</p>
        </div>

        <form id="unsubscribeForm" method="POST" action="/api/newsletter/unsubscribe" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value="${email}"
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Unsubscribe from Newsletter
          </button>
        </form>

        <div id="result" class="mt-4 hidden"></div>

        <div class="mt-6 text-center text-sm text-gray-500">
          <a href="/" class="text-indigo-600 hover:text-indigo-700">← Back to Homeless Hounds</a>
        </div>
      </div>

      <script>
        document.getElementById('unsubscribeForm').addEventListener('submit', async (e) => {
          e.preventDefault();

          const form = e.target;
          const formData = new FormData(form);
          const resultDiv = document.getElementById('result');

          try {
            const response = await fetch('/api/newsletter/unsubscribe', {
              method: 'POST',
              body: formData
            });

            const result = await response.json();

            resultDiv.className = 'mt-4 p-3 rounded-md ' + (result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
            resultDiv.textContent = result.message || result.error;
            resultDiv.classList.remove('hidden');

            if (result.success) {
              form.style.display = 'none';
            }
          } catch (error) {
            resultDiv.className = 'mt-4 p-3 rounded-md bg-red-100 text-red-800';
            resultDiv.textContent = 'An error occurred. Please try again.';
            resultDiv.classList.remove('hidden');
          }
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
};