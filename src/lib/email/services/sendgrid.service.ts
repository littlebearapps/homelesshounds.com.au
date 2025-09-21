/**
 * SendGrid email service with error handling and retry logic
 */

import sgMail from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';
import { getAdminEmails } from './email-router';
import { surrenderConfirmationEmail } from '../templates/surrender-confirmation';
import { adoptionConfirmationEmail } from '../templates/adoption-confirmation';
import { fosterConfirmationEmail } from '../templates/foster-confirmation';
import { petCourierConfirmationEmail } from '../templates/pet-courier-confirmation';
import { adminNotificationEmail } from '../templates/admin-notification';

// Email sending result
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retries?: number;
}

// Email service configuration
export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  maxRetries?: number;
  retryDelay?: number;
}

export class EmailService {
  private initialized = false;
  private config: EmailConfig;
  private env: any;

  constructor(config: EmailConfig, env: any) {
    this.config = {
      ...config,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000
    };
    this.env = env;
  }

  /**
   * Initialize SendGrid with API key
   */
  private initialize() {
    if (!this.initialized) {
      sgMail.setApiKey(this.config.apiKey);
      this.initialized = true;
    }
  }

  /**
   * Send email with retry logic
   */
  private async sendWithRetry(msg: MailDataRequired): Promise<EmailResult> {
    this.initialize();

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const [response] = await sgMail.send(msg);

        return {
          success: true,
          messageId: response.headers['x-message-id'],
          retries: attempt - 1
        };
      } catch (error: any) {
        lastError = error;
        console.error(`Email send attempt ${attempt} failed:`, error.message);

        // Don't retry on permanent failures
        if (error.code === 400 || error.code === 401 || error.code === 403) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.config.maxRetries!) {
          await new Promise(resolve =>
            setTimeout(resolve, this.config.retryDelay! * Math.pow(2, attempt - 1))
          );
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      retries: this.config.maxRetries
    };
  }

  /**
   * Send form submission emails (both admin and user notifications)
   */
  async sendFormEmails(formId: string, formData: any): Promise<{
    admin: EmailResult;
    user: EmailResult | null;
  }> {
    const results = {
      admin: { success: false, error: 'Not attempted' } as EmailResult,
      user: null as EmailResult | null
    };

    // Get admin email routing
    const adminRouting = getAdminEmails(formId, formData, this.env);

    // Generate appropriate email templates
    let userEmailContent: any = null;

    switch (formId) {
      case '66': // Surrender
        if (formData.email) {
          userEmailContent = surrenderConfirmationEmail(formData);
        }
        break;

      case '70': // Dog Adoption
      case '65': // Cat Adoption
        if (formData.email) {
          userEmailContent = adoptionConfirmationEmail(formData);
        }
        break;

      case '68': // Dog Foster
      case '69': // Cat Foster
        if (formData.email) {
          userEmailContent = fosterConfirmationEmail(formData);
        }
        break;

      case '67': // Pet Courier
        if (formData.email) {
          userEmailContent = petCourierConfirmationEmail(formData);
        }
        break;
    }

    // Generate admin notification
    const adminEmailContent = adminNotificationEmail(formId, formData);

    // Send admin notification
    try {
      const adminMsg: MailDataRequired = {
        to: adminRouting.to,
        cc: adminRouting.cc?.length ? adminRouting.cc : undefined,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        subject: adminEmailContent.subject,
        html: adminEmailContent.html,
        text: adminEmailContent.text,
        trackingSettings: {
          clickTracking: {
            enable: false
          }
        }
      };

      results.admin = await this.sendWithRetry(adminMsg);
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      results.admin = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Send user confirmation if email provided
    if (userEmailContent && formData.email) {
      try {
        const userMsg: MailDataRequired = {
          to: formData.email,
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName
          },
          subject: userEmailContent.subject,
          html: userEmailContent.html,
          text: userEmailContent.text,
          trackingSettings: {
            clickTracking: {
              enable: false
            }
          }
        };

        results.user = await this.sendWithRetry(userMsg);
      } catch (error) {
        console.error('Failed to send user confirmation:', error);
        results.user = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return results;
  }

  /**
   * Send a test email to verify configuration
   */
  async sendTestEmail(to: string): Promise<EmailResult> {
    this.initialize();

    const msg: MailDataRequired = {
      to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'Test Email - Homeless Hounds Website',
      html: `
        <h2>Test Email Successful!</h2>
        <p>This is a test email from the Homeless Hounds website.</p>
        <p>If you're seeing this, your SendGrid configuration is working correctly.</p>
        <hr>
        <p><small>Sent: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}</small></p>
      `,
      text: 'Test email from Homeless Hounds. Configuration is working!',
      trackingSettings: {
        clickTracking: {
          enable: false
        }
      }
    };

    return this.sendWithRetry(msg);
  }

  /**
   * Validate email configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.apiKey || this.config.apiKey === 'YOUR_SENDGRID_API_KEY_HERE') {
      errors.push('SendGrid API key not configured');
    }

    if (!this.config.fromEmail) {
      errors.push('From email address not configured');
    }

    if (!this.config.fromName) {
      errors.push('From name not configured');
    }

    // Check if at least one admin email is configured
    const hasAdminEmail = this.env.EMAIL_ADMIN_DEFAULT ||
                         this.env.EMAIL_DOG_ADOPTIONS ||
                         this.env.EMAIL_CAT_ADOPTIONS ||
                         this.env.EMAIL_SURRENDER_APPLICATIONS;

    if (!hasAdminEmail) {
      errors.push('No admin email addresses configured');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Create email service instance from environment
 */
export function createEmailService(env: any): EmailService | null {
  const config: EmailConfig = {
    apiKey: env.SENDGRID_API_KEY || '',
    fromEmail: env.SENDGRID_FROM_EMAIL || '',
    fromName: env.SENDGRID_FROM_NAME || 'Homeless Hounds'
  };

  const service = new EmailService(config, env);

  // Validate configuration
  const validation = service.validateConfig();
  if (!validation.valid) {
    console.error('Email service configuration errors:', validation.errors);
    return null;
  }

  return service;
}