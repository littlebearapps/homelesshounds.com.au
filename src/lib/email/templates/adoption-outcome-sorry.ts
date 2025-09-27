/**
 * Email template for unsuccessful adoption outcome - encouraging message to other applicants
 */

import { baseEmailTemplate, styles, EmailData } from './base';

export const adoptionOutcomeSorryEmail = (data: EmailData) => {
  const content = `
    <h2 ${styles.h2}>
      Thank you for your interest in ${data.animal_name || 'our rescue pet'} 💙
    </h2>

    <p ${styles.p}>
      Thank you${data.firstname ? `, ${data.firstname},` : ''} for submitting an adoption application for
      <strong>${data.animal_name || 'one of our rescue pets'}</strong>. We truly appreciate your interest in giving a homeless pet a loving home.
    </p>

    <div ${styles.infoBox}>
      <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Update on ${data.animal_name || 'This Pet'}</h3>
      <p style="margin: 0; color: #2d3748; font-size: 14px;">
        We're happy to share that <strong>${data.animal_name || 'this pet'}</strong> has found their forever home!
        While we know this may be disappointing, please know that every application helps us find the perfect match for each animal.
      </p>
    </div>

    <p ${styles.p}>
      The decision wasn't easy - we received multiple wonderful applications from caring people like yourself.
      Our adoption team carefully considers each pet's specific needs, temperament, and circumstances to ensure
      the best possible match for both the animal and the family.
    </p>

    ${styles.divider}

    <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;" class="dark-mode-text">Don't Give Up - Your Perfect Match is Out There! 🐾</h3>
    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 15px;" class="dark-mode-subtext">
      We have many other wonderful ${data.similar_animals_url?.includes('cats') ? 'cats' : 'dogs'} looking for their forever homes.
      Your application shows you're ready to provide a loving home, and we encourage you to consider other pets who would benefit from your care.
    </p>

    <div ${styles.successBox}>
      <h3 style="color: #2f855a; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Ready to Apply Again?</h3>
      <p style="margin: 0; color: #2f855a; font-size: 14px;">
        Your browser may remember some of your details from this application.
        Finding another perfect match for your family is just a few clicks away!
      </p>
    </div>

    <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;" class="dark-mode-subtext">
      <li><strong>Browse our available pets</strong> - New animals arrive regularly</li>
      <li><strong>Join our newsletter</strong> - Get notified when new pets become available</li>
      <li><strong>Follow us on social media</strong> - See updates and new arrivals</li>
      <li><strong>Consider fostering</strong> - Make space for more rescues while finding your match</li>
    </ul>

    ${styles.divider}

    <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;" class="dark-mode-text">Other Ways to Help</h3>
    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 15px;" class="dark-mode-subtext">
      While you're searching for your perfect companion, there are other ways to support homeless animals:
    </p>
    <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;" class="dark-mode-subtext">
      <li>Foster a pet temporarily</li>
      <li>Volunteer at our events</li>
      <li>Donate supplies or funds</li>
      <li>Share our posts to help other pets find homes</li>
    </ul>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
      <tr>
        <td align="center" style="padding: 0 10px;">
          <a href="https://homelesshounds.com.au${data.similar_animals_url || '/adopt'}" ${styles.button}>
            ${data.similar_animals_url?.includes('cats') ? 'View Available Cats' : 'View Available Dogs'}
          </a>
        </td>
        <td align="center" style="padding: 0 10px;">
          <a href="https://homelesshounds.com.au/get-involved/foster-care" style="display: inline-block; padding: 12px 24px; background: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #667eea;">
            Learn About Fostering
          </a>
        </td>
      </tr>
    </table>

    <div ${styles.warningBox}>
      <p style="margin: 0; color: #744210; font-size: 13px;">
        <strong>Quick tip:</strong> Follow our social media and check our website regularly.
        New pets arrive weekly, and some may be perfect for your family situation!
      </p>
    </div>

    <p style="color: #718096; font-size: 13px; margin: 20px 0 0;">
      Thank you for your compassion and commitment to animal rescue,<br>
      <strong>The Homeless Hounds Adoption Team</strong>
    </p>

    ${styles.divider}

    <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <p style="color: #4a5568; font-size: 12px; margin: 0; line-height: 1.5;">
        <strong>Why you're receiving this email:</strong> You submitted an adoption application for ${data.animal_name || 'this pet'} on our website. This is an operational message related to your application, not marketing.
        <br><br>
        <strong>From:</strong> Homeless Hounds, QLD, Australia | <strong>Contact:</strong> web@homelesshounds.com.au
        <br><br>
        To withdraw your application or change how we contact you about this application, reply to this email or contact web@homelesshounds.com.au.
        <br><br>
        <a href="https://homelesshounds.com.au/privacy-policy" style="color: #667eea;">Privacy Policy</a>
      </p>
    </div>
  `;

  const preheader = `Thank you for your application. While ${data.animal_name || 'this pet'} found another home, many others are waiting for you!`;

  return {
    subject: `Thank You for Your Application - ${data.animal_name || 'Pet'} Update | Homeless Hounds`,
    html: baseEmailTemplate(content, preheader),
    text: `Thank you${data.firstname ? ` ${data.firstname}` : ''} for your adoption application for ${data.animal_name || 'our rescue pet'}. While this pet has found another home, we have many other wonderful animals looking for families. Please visit https://homelesshounds.com.au${data.similar_animals_url || '/adopt'} to see other available pets. - Homeless Hounds Team`
  };
};