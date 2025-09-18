/**
 * Email template for surrender form confirmation
 */

import { baseEmailTemplate, styles, EmailData } from './base';

export const surrenderConfirmationEmail = (data: EmailData) => {
  const content = `
    <h2 ${styles.h2}>
      Thank you${data.firstname ? `, ${data.firstname}` : ''} 🙏
    </h2>

    <p ${styles.p}>
      We've received your surrender request and understand this is a difficult decision.
      Our team will review your submission with care and compassion.
    </p>

    <div ${styles.infoBox}>
      <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">What happens next?</h3>
      <ol style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;">
        <li>Our team will review your request within 24-48 hours</li>
        <li>We'll contact you to discuss options and next steps</li>
        <li>If accepted, we'll arrange a suitable time for surrender</li>
        <li>We'll work to find the best possible home for your pet</li>
      </ol>
    </div>

    ${data.animalname ? `
      <div ${styles.successBox}>
        <h3 style="color: #2f855a; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Pet Information Received</h3>
        <p style="margin: 0; color: #2f855a; font-size: 14px;">
          <strong>Pet Name:</strong> ${data.animalname}<br>
          ${data.species ? `<strong>Species:</strong> ${data.species}<br>` : ''}
          ${data.breed ? `<strong>Breed:</strong> ${data.breed}` : ''}
        </p>
      </div>
    ` : ''}

    ${styles.divider}

    <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;" class="dark-mode-text">Support & Resources</h3>
    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 15px;" class="dark-mode-subtext">
      If your circumstances change or you need immediate assistance, please don't hesitate to contact us.
      We may be able to provide:
    </p>
    <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;" class="dark-mode-subtext">
      <li>Temporary foster care in emergency situations</li>
      <li>Behavioral support and training resources</li>
      <li>Financial assistance for veterinary care</li>
      <li>Alternative rehoming options</li>
    </ul>

    <div ${styles.warningBox}>
      <p style="margin: 0; color: #744210; font-size: 13px;">
        <strong>Please note:</strong> Acceptance depends on our current capacity and resources.
        We prioritize Victorian residents but may help interstate cases where possible.
      </p>
    </div>

    ${styles.divider}

    <p ${styles.p}>
      If you have any urgent concerns or questions, please contact us directly:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
      <tr>
        <td align="center">
          <a href="https://homelesshounds.com.au/contact-us" ${styles.button}>
            Contact Our Team
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #718096; font-size: 13px; margin: 20px 0 0;">
      With compassion and understanding,<br>
      <strong>The Homeless Hounds Team</strong>
    </p>
  `;

  const preheader = `We've received your surrender request. Our team will contact you within 24-48 hours.`;

  return {
    subject: 'Surrender Request Received - Homeless Hounds',
    html: baseEmailTemplate(content, preheader),
    text: `Thank you${data.firstname ? ` ${data.firstname}` : ''}. We've received your surrender request and will contact you within 24-48 hours. Visit https://homelesshounds.com.au for more information.`
  };
};