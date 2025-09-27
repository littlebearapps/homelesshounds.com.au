import type { APIRoute } from 'astro';

// Submit proxy for adoption applications
// Stores application data locally, then forwards to ASM
export const prerender = false;

const normalizeEmail = (e: string) => e.trim().toLowerCase();

async function verifyTurnstile(secret: string, token: string, ip?: string) {
  if (!secret || !token) return false;

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {})
    })
  });

  const data = await res.json() as { success: boolean };
  return data.success === true;
}

export const POST: APIRoute = async (ctx) => {
  try {
    const env = (ctx.locals as any)?.runtime?.env || {};
    const db = env.DB as D1Database;

    // Parse form data
    const contentType = ctx.request.headers.get('content-type') || '';
    const isForm = contentType.includes('application/x-www-form-urlencoded') ||
                   contentType.includes('multipart/form-data');

    const formData = isForm ?
      await ctx.request.formData() :
      new URLSearchParams(JSON.stringify(await ctx.request.json()));

    // Convert FormData to object for easier processing
    const payload: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        payload[key] = value;
      }
    }

    const {
      animal_id,
      animal_name,
      species,
      applicant_email,
      applicant_phone,
      source_url,
      formid: form_id,
      'cf-turnstile-response': turnstileToken,
    } = payload;

    // --- Validation ---

    // Turnstile verification (if configured)
    if (env.TURNSTILE_SECRET && !(await verifyTurnstile(
      env.TURNSTILE_SECRET,
      turnstileToken,
      ctx.clientAddress
    ))) {
      return new Response('Bot verification failed', { status: 400 });
    }

    // Validate required fields
    if (!animal_id || !/^\d+$/.test(String(animal_id))) {
      return new Response('Invalid animal_id', { status: 400 });
    }

    if (!applicant_email) {
      return new Response('Email required', { status: 400 });
    }

    if (!form_id) {
      return new Response('Form ID required', { status: 400 });
    }

    // Validate form_id against allowlists and derive species
    const dogs = (env.ADOPTION_FORM_IDS_DOGS || '70').split(',').map(s => s.trim()).filter(Boolean);
    const cats = (env.ADOPTION_FORM_IDS_CATS || '65').split(',').map(s => s.trim()).filter(Boolean);
    const allFormIds = new Set([...dogs, ...cats]);

    if (!allFormIds.has(String(form_id))) {
      console.warn('Unknown adoption form_id:', form_id);
      return new Response('Unsupported form', { status: 400 });
    }

    const derivedSpecies = dogs.includes(String(form_id)) ? 'dogs'
                         : cats.includes(String(form_id)) ? 'cats'
                         : (species || '');

    // Normalize email
    const email = normalizeEmail(applicant_email);

    // --- Store Application Locally ---

    try {
      // Supersede any existing applications for same email+animal
      await db.batch([
        db.prepare(
          `UPDATE applications
           SET superseded_at = datetime('now')
           WHERE animal_id = ? AND applicant_email = ? AND superseded_at IS NULL`
        ).bind(String(animal_id), email),

        // Insert new application
        db.prepare(
          `INSERT INTO applications (form_id, animal_id, animal_name, species, applicant_email, applicant_phone, source_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          Number(form_id || 0),
          String(animal_id),
          animal_name || null,
          derivedSpecies || species || null,
          email,
          applicant_phone || null,
          source_url || null
        )
      ]);

      console.log(`Stored adoption application: animal_id=${animal_id}, email=${email}, species=${derivedSpecies}`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with ASM forwarding even if local storage fails
    }

    // --- Forward to ASM ---

    const asmUrl = new URL(env.ASM_BASE_URL || 'https://service.sheltermanager.com/asmservice');
    asmUrl.searchParams.set('method', 'online_form_html');
    asmUrl.searchParams.set('account', env.ASM_ACCOUNT || 'st3418');
    asmUrl.searchParams.set('username', env.ASM_USERNAME);
    asmUrl.searchParams.set('password', env.ASM_PASSWORD);
    asmUrl.searchParams.set('formid', String(form_id));

    // Build FormData for ASM (exclude our tracking fields)
    const asmFormData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      // Skip our internal tracking fields and bot protection
      if (['animal_id', 'cf-turnstile-response'].includes(key)) continue;
      if (value != null) {
        asmFormData.append(key, String(value));
      }
    }

    // Forward to ASM
    const asmResponse = await fetch(asmUrl.toString(), {
      method: 'POST',
      body: asmFormData,
      redirect: 'follow'
    });

    // ASM returns 2xx/3xx on success
    if (!(asmResponse.status >= 200 && asmResponse.status < 400)) {
      console.error('ASM submission failed:', asmResponse.status, await asmResponse.text());
      return new Response('ASM submission failed', { status: 502 });
    }

    // Determine success redirect URL
    const asmLocation = asmResponse.headers.get('location');
    let thankYouPage = '/adopt/thanks';

    if (derivedSpecies === 'dogs' || derivedSpecies === 'cats') {
      thankYouPage = '/adopt/thanks';
    }

    // Return success - redirect to thank you page
    return Response.redirect(asmLocation || thankYouPage, 303);

  } catch (error) {
    console.error('Adoption application submission error:', error);
    return new Response('Submission failed. Please try again.', { status: 500 });
  }
};