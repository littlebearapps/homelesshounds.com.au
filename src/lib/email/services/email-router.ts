/**
 * Email routing service - determines which email addresses to use
 * based on form type and content
 */

export interface EmailRouting {
  to: string[];
  cc?: string[];
  bcc?: string[];
}

/**
 * Get the appropriate admin email addresses based on form type and data
 */
export function getAdminEmails(formId: string, formData: any, env: any): EmailRouting {
  const emails: EmailRouting = {
    to: [],
    cc: [],
    bcc: []
  };

  // Get environment variables
  const {
    EMAIL_DOG_ADOPTIONS,
    EMAIL_CAT_ADOPTIONS,
    EMAIL_FOSTER_APPLICATIONS,
    EMAIL_PET_COURIER,
    EMAIL_SURRENDER_APPLICATIONS,
    EMAIL_VOLUNTEER_APPLICATIONS,
    EMAIL_ACCOUNTS,
    EMAIL_ADMIN_DEFAULT
  } = env;

  switch (formId) {
    case '70': // Dog Adoption Applications
      emails.to.push(EMAIL_DOG_ADOPTIONS || EMAIL_ADMIN_DEFAULT);
      break;

    case '65': // Cat Adoption Applications
      emails.to.push(EMAIL_CAT_ADOPTIONS || EMAIL_ADMIN_DEFAULT);
      break;

    case '66': // Surrender Applications
      emails.to.push(EMAIL_SURRENDER_APPLICATIONS || EMAIL_ADMIN_DEFAULT);
      break;

    case '68': // Dog Foster Applications
      emails.to.push(EMAIL_FOSTER_APPLICATIONS || EMAIL_ADMIN_DEFAULT);
      break;

    case '69': // Cat Foster Applications
      emails.to.push(EMAIL_FOSTER_APPLICATIONS || EMAIL_ADMIN_DEFAULT);
      break;

    case '67': // Pet Courier Applications
      emails.to.push(EMAIL_PET_COURIER || EMAIL_ADMIN_DEFAULT);
      break;

    default:
      // Unknown form type - send to default admin
      emails.to.push(EMAIL_ADMIN_DEFAULT || 'admin@homelesshounds.com.au');
      break;
  }

  // Remove duplicates and filter out empty values
  emails.to = [...new Set(emails.to.filter(email => email))];
  emails.cc = [...new Set(emails.cc.filter(email => email))];
  emails.bcc = [...new Set(emails.bcc.filter(email => email))];

  // If no recipients found, use fallback
  if (emails.to.length === 0) {
    emails.to.push(EMAIL_ADMIN_DEFAULT || 'admin@homelesshounds.com.au');
  }

  return emails;
}

/**
 * Get email configuration for specific notification types
 */
export function getNotificationConfig(notificationType: string, env: any) {
  const {
    EMAIL_ACCOUNTS,
    EMAIL_ADMIN_DEFAULT
  } = env;

  switch (notificationType) {
    case 'donation':
    case 'payment':
    case 'financial':
      return {
        to: [EMAIL_ACCOUNTS || EMAIL_ADMIN_DEFAULT],
        subject_prefix: '[ACCOUNTS]'
      };

    case 'urgent':
    case 'emergency':
      return {
        to: [EMAIL_ADMIN_DEFAULT],
        cc: [EMAIL_SURRENDER_APPLICATIONS], // Surrenders team often handles emergencies
        subject_prefix: '[URGENT]'
      };

    case 'system':
    case 'error':
      return {
        to: [EMAIL_ADMIN_DEFAULT],
        subject_prefix: '[SYSTEM]'
      };

    default:
      return {
        to: [EMAIL_ADMIN_DEFAULT],
        subject_prefix: ''
      };
  }
}

/**
 * Format email addresses for display
 */
export function formatEmailList(emails: string[]): string {
  return emails.filter(e => e).join(', ');
}