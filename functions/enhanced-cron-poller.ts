// Enhanced Cloudflare Pages Function for extensible notification system
// Supports testing/production modes and multiple notification types

type Env = {
  DB: D1Database;
  SENDGRID_API_KEY: string;
  ASM_BASE_URL: string;
  ASM_ACCOUNT: string;
  ASM_USERNAME: string;
  ASM_PASSWORD: string;
  SENDGRID_FROM_EMAIL: string;
  SENDGRID_FROM_NAME: string;
  EMAIL_BCC?: string;
  ADOPTION_NOTIFY_DELAY_HOURS?: string;

  // Testing/Production Mode Controls
  NOTIFICATION_MODE?: string;           // 'testing' | 'production' (default: production)
  TEST_EMAIL_RECIPIENT?: string;        // Override email for testing (default: web@homelesshounds.com.au)
  TEST_TRIGGER_VALUE?: string;          // Value to look for in ASM trigger field
};

const normalizeEmail = (e?: string | null) => (e || '').trim().toLowerCase();

interface NotificationConfig {
  notification_type: string;
  display_name: string;
  enabled: number;
  test_mode: number;
  delay_hours: number;
  template_success_id?: string;
  template_failure_id?: string;
  asm_trigger_field?: string;
  asm_api_method: string;
}

// Import our Astro email templates
import { adoptionOutcomeCongratsEmail } from '../src/lib/email/templates/adoption-outcome-congrats';
import { adoptionOutcomeSorryEmail } from '../src/lib/email/templates/adoption-outcome-sorry';

async function sendEmailWithTemplate(
  env: Env,
  to: string,
  templateFunction: (data: any) => { subject: string; html: string; text: string },
  templateData: Record<string, any>,
  categories: string[],
  testMode: boolean = false,
  originalRecipient?: string
) {
  // In test mode, add test prefix and context
  if (testMode) {
    templateData = {
      ...templateData,
      test_mode: true,
      original_recipient: originalRecipient,
      test_notice: "🧪 THIS IS A TEST EMAIL - Not sent to actual applicant"
    };
    categories = ['test', ...categories];
  }

  // Generate the email content using our Astro template
  const emailContent = templateFunction(templateData);

  // Add test prefix to subject if in test mode
  const subject = testMode ? `[TEST] ${emailContent.subject}` : emailContent.subject;

  const payload = {
    from: {
      email: env.SENDGRID_FROM_EMAIL,
      name: env.SENDGRID_FROM_NAME
    },
    reply_to: {
      email: 'web@homelesshounds.com.au',
      name: 'Homeless Hounds'
    },
    personalizations: [{
      to: [{ email: to }],
      subject: subject,
      custom_args: {
        notification_type: 'adoption_outcome',
        test_mode: testMode ? 'true' : 'false'
      }
    }],
    content: [
      {
        type: 'text/plain',
        value: emailContent.text
      },
      {
        type: 'text/html',
        value: emailContent.html
      }
    ],
    ...(env.EMAIL_BCC ? { bcc: [{ email: env.EMAIL_BCC }] } : {}),
    categories,
    // Transactional emails: bypass marketing unsubscribes but honor bounces/spam
    mail_settings: {
      bypass_list_management: { enabled: true }
    },
    // Minimal tracking for transactional emails
    tracking_settings: {
      open_tracking: { enable: false },
      click_tracking: { enable: false, enable_text: false },
      subscription_tracking: { enable: false }
    }
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

async function fetchASMData(env: Env, method: string, extraParams: Record<string, string> = {}) {
  const url = new URL(env.ASM_BASE_URL);
  url.searchParams.set('method', method);
  url.searchParams.set('account', env.ASM_ACCOUNT);
  url.searchParams.set('username', env.ASM_USERNAME);
  url.searchParams.set('password', env.ASM_PASSWORD);

  // Add any extra parameters
  for (const [key, value] of Object.entries(extraParams)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`ASM ${method} failed ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function generateEventKey(type: string, entityId: string, eventDate: string, identifier: string) {
  const keySource = `${type}|${entityId}|${eventDate}|${identifier}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(keySource);
  const hash = await crypto.subtle.digest('SHA-1', data);
  const hashArray = new Uint8Array(hash);
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function processAdoptionOutcomes(env: Env, config: NotificationConfig) {
  const db = env.DB;
  const isTestMode = env.NOTIFICATION_MODE === 'testing' || config.test_mode === 1;
  const testEmail = env.TEST_EMAIL_RECIPIENT || 'web@homelesshounds.com.au';
  const testTriggerValue = env.TEST_TRIGGER_VALUE || 'TEST_ADOPTION_NOTIFICATION';

  console.log(`Processing adoption outcomes - Mode: ${isTestMode ? 'TESTING' : 'PRODUCTION'}`);

  // Get polling state
  const pollState = await db.prepare(
    `SELECT * FROM notification_poll_state WHERE id = ?`
  ).bind(config.notification_type).first<any>();

  const since = pollState?.last_seen_ts || hoursAgoISO(24);
  let maxSeen = since;

  if (isTestMode) {
    console.log(`Test mode: Looking for ${config.asm_trigger_field} = "${testTriggerValue}"`);

    // In test mode, fetch current adoptable animals and check trigger field
    const animals = await fetchASMData(env, 'json_adoptable_animals');

    for (const animal of animals) {
      const triggerField = animal[config.asm_trigger_field!];
      const animalId = String(animal.ID || '');

      if (triggerField === testTriggerValue && animalId) {
        console.log(`Test trigger found for animal ${animalId}`);

        // Create synthetic adoption event for testing
        const adoptionKey = await generateEventKey('adoption_test', animalId, new Date().toISOString(), 'test');
        const now = new Date().toISOString().replace('T', ' ').replace('Z', '');

        await db.prepare(
          `INSERT OR REPLACE INTO adoption_events
           (adoption_key, animal_id, animal_name, species, adoption_date, new_owner_email, raw)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          adoptionKey,
          animalId,
          animal.ANIMALNAME || 'Test Animal',
          animal.SPECIESNAME || 'Dog',
          now,
          'test@example.com', // Synthetic adopter
          JSON.stringify({ ...animal, test_mode: true })
        ).run();

        maxSeen = now;
        console.log(`Created test adoption event for animal ${animalId}`);
      }
    }
  } else {
    // Production mode: fetch real adoption data
    const adoptions = await fetchASMData(env, config.asm_api_method);
    console.log(`Found ${adoptions.length} recent adoption records`);

    for (const item of adoptions) {
      const animalId = String(item?.ID || item?.animal?.ID || item?.animal_id || '');
      if (!animalId) continue;

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

      const adoptionKey = await generateEventKey('adoption', animalId, adoptionDate, ownerEmail);

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

        if (adoptionDate > maxSeen) maxSeen = adoptionDate;
      } catch (dbError) {
        console.error('Failed to store adoption event:', dbError);
      }
    }
  }

  // Update polling state
  if (maxSeen > since) {
    await db.prepare(
      `UPDATE notification_poll_state
       SET last_seen_ts = ?, test_mode = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(maxSeen, isTestMode ? 1 : 0, config.notification_type).run();
  }

  // Process matured events
  const delayHrs = config.delay_hours || 12;
  const cutoff = isTestMode ? new Date().toISOString().replace('T', ' ').replace('Z', '') : hoursAgoISO(delayHrs);

  console.log(`Processing adoptions ${isTestMode ? 'immediately (test mode)' : `older than ${delayHrs} hours`}`);

  const maturedEvents = await db.prepare(
    `SELECT * FROM adoption_events
     WHERE adoption_date <= ?
     ORDER BY adoption_date DESC
     LIMIT ${isTestMode ? 10 : 50}`
  ).bind(cutoff).all<any>();

  console.log(`Found ${maturedEvents.results?.length || 0} matured adoption events`);

  for (const event of maturedEvents.results || []) {
    const { animal_id, animal_name, species, adoption_date, new_owner_email, raw } = event;

    // Parse raw ASM data to get additional animal info like photos
    let animalData = {};
    try {
      animalData = raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn(`Failed to parse raw animal data for ${animal_id}:`, e);
    }

    // Check suppression
    const suppressed = await db.prepare(
      `SELECT 1 FROM adoption_suppressions
       WHERE animal_id = ? AND notification_type = ?`
    ).bind(animal_id, config.notification_type).first();

    if (suppressed) {
      console.log(`Skipping suppressed animal: ${animal_id}`);
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

    console.log(`Processing ${applicantEmails.length} applicants for animal ${animal_id} (${isTestMode ? 'TEST MODE' : 'PRODUCTION'})`);

    const winnerEmail = normalizeEmail(new_owner_email);
    const successfulApplicant = winnerEmail && applicantEmails.find(email => email === winnerEmail);

    // Send congratulations email
    if (successfulApplicant) {
      const recipient = isTestMode ? testEmail : successfulApplicant;

      const existingCongrats = await db.prepare(
        `SELECT 1 FROM adoption_outcome_notifications
         WHERE animal_id = ? AND applicant_email = ? AND notification_type = 'congrats' AND test_mode = ?`
      ).bind(animal_id, successfulApplicant, isTestMode ? 1 : 0).first();

      if (!existingCongrats) {
        console.log(`Sending congratulations to: ${recipient} ${isTestMode ? `(original: ${successfulApplicant})` : ''}`);

        // Generate animal photo URL from ASM if available
        const animalPhoto = animalData?.WEBSITEIMAGENAME
          ? `https://service.sheltermanager.com/asmservice?method=animal_image&animalid=${animal_id}&account=${env.ASM_ACCOUNT}`
          : null;

        const resp = await sendEmailWithTemplate(env, recipient, adoptionOutcomeCongratsEmail, {
          animal_name: animal_name || 'your new pet',
          animal_photo: animalPhoto,
          adoption_date: adoption_date,
          species: species || 'Pet'
        }, ['adoption_congrats'], isTestMode, successfulApplicant);

        await db.prepare(
          `INSERT INTO adoption_outcome_notifications
           (animal_id, applicant_email, notification_type, sendgrid_message_id, status, error, sent_at, test_mode, original_recipient)
           VALUES (?, ?, 'congrats', ?, ?, ?, datetime('now'), ?, ?)`
        ).bind(
          animal_id,
          successfulApplicant,
          resp.messageId || null,
          resp.ok ? 'sent' : 'failed',
          resp.ok ? null : `${resp.status}: ${resp.text}`,
          isTestMode ? 1 : 0,
          isTestMode ? successfulApplicant : null
        ).run();
      }
    }

    // Send sorry emails to other applicants
    for (const applicantEmail of applicantEmails) {
      if (applicantEmail === successfulApplicant) continue;

      const recipient = isTestMode ? testEmail : applicantEmail;

      const existingSorry = await db.prepare(
        `SELECT 1 FROM adoption_outcome_notifications
         WHERE animal_id = ? AND applicant_email = ? AND notification_type = 'sorry' AND test_mode = ?`
      ).bind(animal_id, applicantEmail, isTestMode ? 1 : 0).first();

      if (existingSorry) continue;

      console.log(`Sending sorry notification to: ${recipient} ${isTestMode ? `(original: ${applicantEmail})` : ''}`);

      const animalSpecies = (species || '').toLowerCase().includes('cat') ? 'cats' : 'dogs';
      const similarUrl = `/adopt/${animalSpecies}`;

      const resp = await sendEmailWithTemplate(env, recipient, adoptionOutcomeSorryEmail, {
        animal_name: animal_name || 'the pet',
        similar_animals_url: similarUrl,
        species: species || 'Pet'
      }, ['adoption_sorry'], isTestMode, applicantEmail);

      await db.prepare(
        `INSERT INTO adoption_outcome_notifications
         (animal_id, applicant_email, notification_type, sendgrid_message_id, status, error, sent_at, test_mode, original_recipient)
         VALUES (?, ?, 'sorry', ?, ?, ?, datetime('now'), ?, ?)`
      ).bind(
        animal_id,
        applicantEmail,
        resp.messageId || null,
        resp.ok ? 'sent' : 'failed',
        resp.ok ? null : `${resp.status}: ${resp.text}`,
        isTestMode ? 1 : 0,
        isTestMode ? applicantEmail : null
      ).run();
    }
  }
}

export const onSchedule: PagesFunction<Env> = async (event) => {
  const env = event.env;
  const db = env.DB;

  console.log('Starting enhanced notification polling job');

  try {
    // Get all enabled notification configurations
    const configs = await db.prepare(
      `SELECT * FROM notification_configs WHERE enabled = 1`
    ).all<NotificationConfig>();

    console.log(`Found ${configs.results?.length || 0} enabled notification types`);

    for (const config of configs.results || []) {
      console.log(`Processing: ${config.display_name} (${config.notification_type})`);

      try {
        switch (config.notification_type) {
          case 'adoption_outcome':
            await processAdoptionOutcomes(env, config);
            break;

          // Future notification types can be added here:
          // case 'foster_outcome':
          //   await processFosterOutcomes(env, config);
          //   break;

          default:
            console.warn(`Unknown notification type: ${config.notification_type}`);
        }
      } catch (typeError) {
        console.error(`Failed to process ${config.notification_type}:`, typeError);
        // Continue with other notification types
      }
    }

    console.log('Enhanced notification polling job completed successfully');

  } catch (error) {
    console.error('Enhanced notification polling job failed:', error);
    throw error;
  }
};