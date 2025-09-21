/**
 * SendGrid Newsletter Integration
 * Handles newsletter subscriptions, contact management, and marketing automation
 */

interface NewsletterContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
  userType: 'adopter' | 'volunteer' | 'general' | 'foster' | 'courier' | 'foster-carer';
  interests?: string[];
  source?: string;
  marketingOptIn: boolean; // True = can receive marketing emails, False = contact only (operational emails)
  subscriptionDate: string;
  contactReason?: string; // Why they provided their details (adoption, volunteer, surrender, etc.)
}

interface SendGridContactResponse {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface SendGridListResponse {
  id: string;
  name: string;
  contact_count: number;
}

class SendGridNewsletterService {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';

  // Contact list IDs (to be created in SendGrid)
  private readonly contactLists = {
    // Marketing lists (opt-in required)
    newsletterGeneral: 'newsletter-general',
    newsletterAdopters: 'newsletter-adopters',
    newsletterVolunteers: 'newsletter-volunteers',
    newsletterFoster: 'newsletter-foster',

    // Contact lists (all contacts, operational emails only)
    contactsAll: 'contacts-all',
    contactsAdopters: 'contacts-adopters',
    contactsVolunteers: 'contacts-volunteers',
    contactsFoster: 'contacts-foster',
    contactsCouriers: 'contacts-couriers'
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Add a contact to SendGrid with appropriate segmentation
   */
  async addContact(contact: NewsletterContact): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      // Prepare contact data for SendGrid
      const sendGridContact = {
        email: contact.email,
        first_name: contact.firstName || '',
        last_name: contact.lastName || '',
        phone_number: contact.phone || '',
        city: contact.city || '',
        state_province_region: contact.state || '',
        custom_fields: {
          user_type: contact.userType,
          interests: contact.interests?.join(', ') || '',
          source: contact.source || 'website',
          marketing_opt_in: contact.marketingOptIn,
          subscription_date: contact.subscriptionDate,
          contact_reason: contact.contactReason || '',
          contact_status: contact.marketingOptIn ? 'marketing_subscribed' : 'contact_only'
        }
      };

      // Add contact to SendGrid
      const response = await fetch(`${this.baseUrl}/marketing/contacts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contacts: [sendGridContact]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`SendGrid API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      const contactId = result.job_id; // SendGrid returns a job ID for bulk operations

      // Add to appropriate lists based on user type and marketing preference
      await this.addContactToLists(contact.email, contact.userType, contact.marketingOptIn);

      // Send welcome email if opted in for marketing
      if (contact.marketingOptIn) {
        await this.sendWelcomeEmail(contact);
      } else {
        // Send operational confirmation email (non-marketing)
        await this.sendContactConfirmationEmail(contact);
      }

      return { success: true, contactId };
    } catch (error) {
      console.error('SendGrid newsletter subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Add contact to specific lists based on user type and marketing preference
   */
  private async addContactToLists(email: string, userType: string, marketingOptIn: boolean): Promise<void> {
    const contactLists = ['contactsAll']; // Everyone goes to the all contacts list
    const marketingLists: string[] = [];

    // Add to specific contact lists based on user type (operational emails)
    switch (userType) {
      case 'adopter':
        contactLists.push('contactsAdopters');
        if (marketingOptIn) marketingLists.push('newsletterAdopters');
        break;
      case 'volunteer':
        contactLists.push('contactsVolunteers');
        if (marketingOptIn) marketingLists.push('newsletterVolunteers');
        break;
      case 'foster':
      case 'foster-carer':
        contactLists.push('contactsFoster');
        if (marketingOptIn) marketingLists.push('newsletterFoster');
        break;
      case 'courier':
        contactLists.push('contactsCouriers');
        if (marketingOptIn) marketingLists.push('newsletterGeneral');
        break;
      default:
        if (marketingOptIn) marketingLists.push('newsletterGeneral');
        break;
    }

    // Note: In production, you'd use actual SendGrid list IDs
    // For now, we'll log the intended lists
    console.log(`Adding ${email} to contact lists: ${contactLists.join(', ')}`);
    if (marketingLists.length > 0) {
      console.log(`Adding ${email} to marketing lists: ${marketingLists.join(', ')}`);
    } else {
      console.log(`${email} NOT added to marketing lists (no opt-in)`);
    }
  }

  /**
   * Send operational confirmation email to new contacts (non-marketing)
   */
  private async sendContactConfirmationEmail(contact: NewsletterContact): Promise<void> {
    const emailData = {
      personalizations: [{
        to: [{ email: contact.email, name: contact.firstName ? `${contact.firstName} ${contact.lastName}`.trim() : undefined }],
        dynamic_template_data: {
          firstName: contact.firstName || 'Friend',
          userType: contact.userType,
          contactReason: contact.contactReason || 'your inquiry',
          organizationName: 'Homeless Hounds'
        }
      }],
      from: {
        email: 'noreply@homelesshounds.com.au',
        name: 'Homeless Hounds'
      },
      template_id: 'd-contact-confirmation-template', // Template ID to be created in SendGrid
      categories: ['operational', 'confirmation']
    };

    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send confirmation email: ${response.status}`);
      }

      console.log(`Operational confirmation email sent to ${contact.email}`);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't throw - contact saving should still succeed
    }
  }

  /**
   * Send welcome email to new subscribers
   */
  private async sendWelcomeEmail(contact: NewsletterContact): Promise<void> {
    const emailData = {
      personalizations: [{
        to: [{ email: contact.email, name: contact.firstName ? `${contact.firstName} ${contact.lastName}`.trim() : undefined }],
        dynamic_template_data: {
          firstName: contact.firstName || 'Friend',
          userType: contact.userType,
          interests: contact.interests?.join(', ') || '',
          unsubscribeUrl: `${import.meta.env.SITE}/newsletter/unsubscribe?email=${encodeURIComponent(contact.email)}`
        }
      }],
      from: {
        email: 'noreply@homelesshounds.com.au',
        name: 'Homeless Hounds'
      },
      template_id: 'd-welcome-newsletter-template', // Template ID to be created in SendGrid
      categories: ['newsletter', 'welcome']
    };

    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send welcome email: ${response.status}`);
      }

      console.log(`Welcome email sent to ${contact.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw - newsletter subscription should still succeed
    }
  }

  /**
   * Remove contact from all lists (unsubscribe)
   */
  async unsubscribeContact(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, find the contact
      const searchResponse = await fetch(`${this.baseUrl}/marketing/contacts/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `email = '${email}'`
        })
      });

      if (!searchResponse.ok) {
        throw new Error(`Failed to find contact: ${searchResponse.status}`);
      }

      const searchResult = await searchResponse.json();

      if (!searchResult.result || searchResult.result.length === 0) {
        return { success: false, error: 'Contact not found' };
      }

      const contactId = searchResult.result[0].id;

      // Delete the contact (this removes them from all lists)
      const deleteResponse = await fetch(`${this.baseUrl}/marketing/contacts`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: [contactId]
        })
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to unsubscribe contact: ${deleteResponse.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('SendGrid unsubscribe error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update contact preferences
   */
  async updateContactPreferences(email: string, updates: Partial<NewsletterContact>): Promise<{ success: boolean; error?: string }> {
    try {
      const sendGridUpdate = {
        email: email,
        custom_fields: {
          ...(updates.userType && { user_type: updates.userType }),
          ...(updates.interests && { interests: updates.interests.join(', ') }),
          ...(updates.marketingOptIn !== undefined && { marketing_opt_in: updates.marketingOptIn })
        }
      };

      const response = await fetch(`${this.baseUrl}/marketing/contacts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contacts: [sendGridUpdate]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update contact: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('SendGrid update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get newsletter statistics
   */
  async getNewsletterStats(): Promise<{
    totalContacts: number;
    subscribersByType: Record<string, number>;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/marketing/stats/contacts`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.status}`);
      }

      const stats = await response.json();

      return {
        totalContacts: stats.contact_count || 0,
        subscribersByType: {
          general: 0, // Would need to query specific lists for accurate counts
          adopters: 0,
          volunteers: 0,
          foster: 0
        }
      };
    } catch (error) {
      console.error('SendGrid stats error:', error);
      return {
        totalContacts: 0,
        subscribersByType: {},
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export singleton instance
export const sendGridNewsletter = new SendGridNewsletterService(
  import.meta.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY || ''
);

export type { NewsletterContact };