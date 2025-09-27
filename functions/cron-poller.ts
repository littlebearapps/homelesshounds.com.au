// Cloudflare Pages Function for scheduled adoption polling and notifications
// Runs every 10 minutes via cron trigger to check for new adoptions

type Env = {
  DB: D1Database;
  SENDGRID_API_KEY: string;
  ASM_BASE_URL: string;
  ASM_ACCOUNT: string;
  ASM_USERNAME: string;
  ASM_PASSWORD: string;
  TEMPLATE_CONGRATS_ID: string;
  TEMPLATE_SORRY_ID: string;
  EMAIL_FROM: string;
  EMAIL_BCC?: string;
  ADOPTION_NOTIFY_DELAY_HOURS?: string;
};

const normalizeEmail = (e?: string | null) => (e || '').trim().toLowerCase();

async function sendSendGrid(
  env: Env,
  to: string,
  templateId: string,
  dynamicData: Record<string, any>,
  categories: string[]
) {
  const payload = {
    from: { email: env.EMAIL_FROM },
    personalizations: [{
      to: [{ email: to }],
      dynamic_template_data: dynamicData
    }],
    template_id: templateId,
    ...(env.EMAIL_BCC ? { bcc: [{ email: env.EMAIL_BCC }] } : {}),
    categories
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return {
    ok: res.ok,
    messageId: res.headers.get('x-message-id') || undefined,
    status: res.status,
    text: await res.text()
  };
}

function hoursAgoISO(hours: number) {
  return new Date(Date.now() - hours * 3600_000)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');
}

async function fetchRecentAdoptions(env: Env, sinceISO: string) {
  const url = new URL(env.ASM_BASE_URL);
  url.searchParams.set('method', 'json_recent_adoptions');
  url.searchParams.set('account', env.ASM_ACCOUNT);
  url.searchParams.set('username', env.ASM_USERNAME);
  url.searchParams.set('password', env.ASM_PASSWORD);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`ASM recent_adoptions failed ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// For v1, always return true - rely on 12h delay for safety
async function isStillAdopted(env: Env, animalId: string): Promise<boolean> {
  return true;
}

async function generateAdoptionKey(animalId: string, adoptionDate: string, ownerEmail: string) {
  const keySource = `${animalId}|${adoptionDate}|${ownerEmail}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(keySource);
  const hash = await crypto.subtle.digest('SHA-1', data);
  const hashArray = new Uint8Array(hash);
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const onSchedule: PagesFunction<Env> = async (event) => {
  const env = event.env;
  const db = env.DB;

  console.log('Starting adoption polling and notification job');

  try {
    // Load high-water mark
    const state = await db.prepare(
      `SELECT last_seen_ts FROM adoption_poll_state WHERE id = 'recent_adoptions'`
    ).first<{ last_seen_ts: string }>();

    const since = state?.last_seen_ts || hoursAgoISO(24);
    console.log(`Polling ASM for adoptions since: ${since}`);

    // Fetch recent adoptions from ASM
    const adoptions: any[] = await fetchRecentAdoptions(env, since);
    console.log(`Found ${adoptions.length} recent adoption records`);

    let maxSeen = since;

    // Store adoption events idempotently
    for (const item of adoptions) {
      const animalId = String(item?.ID || item?.animal?.ID || item?.animal_id || '');
      if (!animalId) continue;

      // Extract adoption date (try multiple possible field names)
      const adoptionDate = (
        item?.ADOPTIONDATE ||
        item?.MOVEMENTDATE ||
        item?.date ||
        item?.adoption_date ||
        ''
      ).replace('T', ' ').replace('Z', '');

      if (!adoptionDate) continue;

      const ownerEmail = normalizeEmail(
        item?.CURRENTOWNEREMAILADDRESS ||
        item?.owner_email ||
        item?.new_owner_email
      );

      const adoptionKey = await generateAdoptionKey(animalId, adoptionDate, ownerEmail);

      // Store adoption event
      try {
        await db.prepare(
          `INSERT OR IGNORE INTO adoption_events
           (adoption_key, animal_id, animal_name, species, adoption_date, new_owner_email, raw)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          adoptionKey,
          animalId,
          item?.ANIMALNAME || item?.animal?.ANIMALNAME || item?.animal_name || null,
          item?.SPECIESNAME || item?.animal?.SPECIESNAME || item?.species || null,
          adoptionDate,
          ownerEmail || null,
          JSON.stringify(item)
        ).run();

        console.log(`Stored adoption event: animal_id=${animalId}, date=${adoptionDate}`);
      } catch (dbError) {
        console.error('Failed to store adoption event:', dbError);
      }

      if (adoptionDate > maxSeen) maxSeen = adoptionDate;
    }

    // Update high-water mark
    if (maxSeen > since) {
      await db.prepare(
        `UPDATE adoption_poll_state SET last_seen_ts = ? WHERE id = 'recent_adoptions'`
      ).bind(maxSeen).run();
      console.log(`Updated high-water mark to: ${maxSeen}`);
    }

    // Process matured events (after delay period)
    const delayHrs = Number(env.ADOPTION_NOTIFY_DELAY_HOURS || '12');
    const cutoff = hoursAgoISO(delayHrs);

    console.log(`Processing adoptions older than ${delayHrs} hours (before ${cutoff})`);

    const maturedEvents = await db.prepare(
      `SELECT * FROM adoption_events
       WHERE adoption_date <= ?
       ORDER BY adoption_date DESC
       LIMIT 50`
    ).bind(cutoff).all<any>();

    console.log(`Found ${maturedEvents.results?.length || 0} matured adoption events`);

    for (const event of maturedEvents.results || []) {
      const { animal_id, animal_name, species, adoption_date, new_owner_email } = event;

      // Check suppression
      const suppressed = await db.prepare(
        `SELECT 1 FROM adoption_suppressions WHERE animal_id = ?`
      ).bind(animal_id).first();

      if (suppressed) {
        console.log(`Skipping suppressed animal: ${animal_id}`);
        continue;
      }

      // Re-verify adoption (simple check for v1)
      if (!(await isStillAdopted(env, animal_id))) {
        console.log(`Animal ${animal_id} no longer adopted - skipping notifications`);
        continue;
      }

      // Get applicants for this animal
      const applicants = await db.prepare(
        `SELECT applicant_email FROM applications
         WHERE animal_id = ? AND superseded_at IS NULL AND created_at <= ?`
      ).bind(animal_id, adoption_date).all<{ applicant_email: string }>();

      const applicantEmails = applicants.results?.map(a => a.applicant_email) || [];

      if (applicantEmails.length === 0) {
        console.log(`No applicants found for animal ${animal_id}`);
        continue;
      }

      console.log(`Processing ${applicantEmails.length} applicants for animal ${animal_id}`);

      const winnerEmail = normalizeEmail(new_owner_email);
      const successfulApplicant = winnerEmail && applicantEmails.find(email => email === winnerEmail);

      // Send congratulations email to successful applicant
      if (successfulApplicant) {
        const existingCongrats = await db.prepare(
          `SELECT 1 FROM adoption_outcome_notifications
           WHERE animal_id = ? AND applicant_email = ? AND notification_type = 'congrats'`
        ).bind(animal_id, successfulApplicant).first();

        if (!existingCongrats) {
          console.log(`Sending congratulations to: ${successfulApplicant}`);

          const resp = await sendSendGrid(env, successfulApplicant, env.TEMPLATE_CONGRATS_ID, {
            animal_name: animal_name || 'your new pet',
            adoption_date: adoption_date
          }, ['adoption_congrats']);

          await db.prepare(
            `INSERT INTO adoption_outcome_notifications
             (animal_id, applicant_email, notification_type, sendgrid_message_id, status, error, sent_at)
             VALUES (?, ?, 'congrats', ?, ?, ?, datetime('now'))`
          ).bind(
            animal_id,
            successfulApplicant,
            resp.messageId || null,
            resp.ok ? 'sent' : 'failed',
            resp.ok ? null : `${resp.status}: ${resp.text}`
          ).run();
        }
      }

      // Send sorry emails to all other applicants
      for (const applicantEmail of applicantEmails) {
        if (applicantEmail === successfulApplicant) continue;

        const existingSorry = await db.prepare(
          `SELECT 1 FROM adoption_outcome_notifications
           WHERE animal_id = ? AND applicant_email = ? AND notification_type = 'sorry'`
        ).bind(animal_id, applicantEmail).first();

        if (existingSorry) continue;

        console.log(`Sending sorry notification to: ${applicantEmail}`);

        // Determine similar animals URL based on species
        const animalSpecies = (species || '').toLowerCase().includes('cat') ? 'cats' : 'dogs';
        const similarUrl = `/adopt/${animalSpecies}`;

        const resp = await sendSendGrid(env, applicantEmail, env.TEMPLATE_SORRY_ID, {
          animal_name: animal_name || 'the pet',
          similar_animals_url: similarUrl
        }, ['adoption_sorry']);

        await db.prepare(
          `INSERT INTO adoption_outcome_notifications
           (animal_id, applicant_email, notification_type, sendgrid_message_id, status, error, sent_at)
           VALUES (?, ?, 'sorry', ?, ?, ?, datetime('now'))`
        ).bind(
          animal_id,
          applicantEmail,
          resp.messageId || null,
          resp.ok ? 'sent' : 'failed',
          resp.ok ? null : `${resp.status}: ${resp.text}`
        ).run();
      }
    }

    console.log('Adoption polling and notification job completed successfully');

  } catch (error) {
    console.error('Adoption polling job failed:', error);
    throw error; // Re-throw to trigger Cloudflare retry
  }
};