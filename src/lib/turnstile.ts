/**
 * Turnstile validation utility
 * Validates Cloudflare Turnstile tokens for spam protection
 */

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function validateTurnstile(token: string): Promise<boolean> {
  try {
    // Get the secret key from environment
    const secretKey = import.meta.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;

    // If no secret key configured, skip validation (development mode)
    if (!secretKey) {
      console.warn('Turnstile secret key not configured - skipping validation');
      return true;
    }

    // Verify the token with Cloudflare
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token
      })
    });

    if (!response.ok) {
      console.error('Turnstile verification request failed:', response.status);
      return false;
    }

    const result = await response.json() as { success: boolean };
    return result.success;

  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
}