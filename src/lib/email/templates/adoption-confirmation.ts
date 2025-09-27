/**
 * Email template for adoption application confirmation
 */

import { baseEmailTemplate, styles, EmailData } from './base';

export const adoptionConfirmationEmail = (data: EmailData) => {
  const content = `
    <h2 ${styles.h2}>
      Thank you${data.firstname ? `, ${data.firstname}` : ''} for your adoption application! 🏡
    </h2>

    <p ${styles.p}>
      We're excited about your interest in adopting${data.pet_name ? ` ${data.pet_name}` : ' one of our rescue pets'}!
      Your application has been received and our adoption team will review it shortly.
    </p>

    ${data.pet_name ? `
      <div ${styles.successBox}>
        <h3 style="color: #2f855a; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Pet You Applied For</h3>
        <p style="margin: 0; color: #2f855a; font-size: 14px;">
          <strong>Name:</strong> ${data.pet_name}<br>
          ${data.pet_breed ? `<strong>Breed:</strong> ${data.pet_breed}<br>` : ''}
          ${data.pet_species ? `<strong>Type:</strong> ${data.pet_species}` : ''}
        </p>
      </div>
    ` : ''}

    <div ${styles.infoBox}>
      <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Adoption Process Timeline</h3>
      <ol style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;">
        <li><strong>Application Review</strong> - Within 24-48 hours</li>
        <li><strong>Reference Checks</strong> - We may contact your references</li>
        <li><strong>Meet & Greet</strong> - Arrange a meeting with your potential new family member</li>
        <li><strong>Home Check</strong> - Quick visit to ensure a safe environment</li>
        <li><strong>Adoption Finalised</strong> - Welcome your new pet home!</li>
      </ol>
    </div>

    ${styles.divider}

    <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">What to Expect</h3>
    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 15px;">
      Our adoption co-ordinator will contact you within the next 24-48 hours to discuss your application.
      In the meantime, here are some things you can do to prepare:
    </p>
    <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;">
      <li>Ensure your references are aware we may contact them</li>
      <li>Prepare any questions you have about the pet</li>
      <li>Consider what supplies you'll need for your new pet</li>
      <li>Review our adoption resources on our website</li>
    </ul>

    <div ${styles.warningBox}>
      <p style="margin: 0; color: #744210; font-size: 13px;">
        <strong>Important:</strong> Submitting an application does not guarantee adoption.
        We carefully match pets with families to ensure the best outcome for everyone.
      </p>
    </div>

    ${styles.divider}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
      <tr>
        <td align="center" style="padding: 0 10px;">
          <a href="https://homelesshounds.com.au/adopt" ${styles.button}>
            View More Pets
          </a>
        </td>
        <td align="center" style="padding: 0 10px;">
          <a href="https://homelesshounds.com.au/resources/adoption" style="display: inline-block; padding: 12px 24px; background: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #667eea;">
            Adoption Resources
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #718096; font-size: 13px; margin: 20px 0 0;">
      Warm regards,<br>
      <strong>The Homeless Hounds Adoption Team</strong>
    </p>

    ${styles.divider}

    <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <p style="color: #4a5568; font-size: 12px; margin: 0; line-height: 1.5;">
        <strong>Why you're receiving this email:</strong> You submitted an adoption application${data.pet_name || data.animalname ? ` for ${data.pet_name || data.animalname}` : ''} on our website. This is an operational message confirming receipt of your application, not marketing.
        <br><br>
        <strong>From:</strong> Homeless Hounds, QLD, Australia | <strong>Contact:</strong> web@homelesshounds.com.au
        <br><br>
        To withdraw your application or update your information, reply to this email or contact web@homelesshounds.com.au.
        <br><br>
        <a href="https://homelesshounds.com.au/privacy-policy" style="color: #667eea;">Privacy Policy</a>
      </p>
    </div>
  `;

  const preheader = `Your adoption application has been received! We'll contact you within 24-48 hours.`;

  return {
    subject: `Adoption Application Received${data.pet_name ? ` - ${data.pet_name}` : ''} | Homeless Hounds`,
    html: baseEmailTemplate(content, preheader),
    text: `Thank you${data.firstname ? ` ${data.firstname}` : ''} for your adoption application${data.pet_name ? ` for ${data.pet_name}` : ''}. We'll contact you within 24-48 hours. Visit https://homelesshounds.com.au/adopt for more information.`
  };
};