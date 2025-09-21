/**
 * Email template for admin notifications when forms are submitted
 */

import { baseEmailTemplate, styles, EmailData } from './base';

export const adminNotificationEmail = (formType: string, data: EmailData) => {
  const formTypeLabels: { [key: string]: string } = {
    '66': 'Surrender Request',
    '70': 'Dog Adoption Application',
    '65': 'Cat Adoption Application',
    '68': 'Dog Foster Application',
    '69': 'Cat Foster Application',
    '67': 'Pet Courier Application',
  };

  const formLabel = formTypeLabels[formType] || `Form ${formType}`;

  const content = `
    <h2 ${styles.h2}>
      New ${formLabel} Received 📋
    </h2>

    <p ${styles.p}>
      A new ${formLabel.toLowerCase()} has been submitted through the website.
      Please review and respond within 24-48 hours.
    </p>

    <div ${styles.infoBox}>
      <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Submission Details</h3>
      <table role="presentation" cellspacing="0" cellpadding="5" border="0" style="width: 100%;">
        <tr>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;"><strong>Form Type:</strong></td>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;">${formLabel}</td>
        </tr>
        <tr>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;"><strong>Submitted:</strong></td>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;">${new Date().toLocaleString('en-AU', {
            timeZone: 'Australia/Melbourne',
            dateStyle: 'medium',
            timeStyle: 'short'
          })}</td>
        </tr>
        ${data.firstname || data.lastname ? `
        <tr>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;"><strong>Name:</strong></td>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;">${data.firstname || ''} ${data.lastname || ''}</td>
        </tr>
        ` : ''}
        ${data.email ? `
        <tr>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;"><strong>Email:</strong></td>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;">
            <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a>
          </td>
        </tr>
        ` : ''}
        ${data.cellphone || data.phone ? `
        <tr>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;"><strong>Phone:</strong></td>
          <td style="color: #4a5568; font-size: 14px; padding: 5px 0;">
            <a href="tel:${data.cellphone || data.phone}" style="color: #667eea; text-decoration: none;">${data.cellphone || data.phone}</a>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${formType === '37' && (data.animalname || data.species || data.breed) ? `
      <div ${styles.warningBox}>
        <h3 style="color: #744210; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Pet Information</h3>
        <p style="margin: 0; color: #744210; font-size: 14px;">
          ${data.animalname ? `<strong>Name:</strong> ${data.animalname}<br>` : ''}
          ${data.species ? `<strong>Species:</strong> ${data.species}<br>` : ''}
          ${data.breed ? `<strong>Breed:</strong> ${data.breed}` : ''}
        </p>
      </div>
    ` : ''}

    ${formType === '39' && (data.pet_name || data.pet_breed) ? `
      <div ${styles.successBox}>
        <h3 style="color: #2f855a; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Pet Applied For</h3>
        <p style="margin: 0; color: #2f855a; font-size: 14px;">
          ${data.pet_name ? `<strong>Name:</strong> ${data.pet_name}<br>` : ''}
          ${data.pet_breed ? `<strong>Breed:</strong> ${data.pet_breed}<br>` : ''}
          ${data.pet_species ? `<strong>Type:</strong> ${data.pet_species}` : ''}
        </p>
      </div>
    ` : ''}

    ${styles.divider}

    <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;" class="dark-mode-text">Required Actions</h3>
    <ul ${styles.list}>
      <li>Review the complete submission in ASM</li>
      <li>Contact the applicant within 24-48 hours</li>
      <li>Update the status in the system</li>
      <li>Follow standard ${formLabel.toLowerCase()} procedures</li>
    </ul>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
      <tr>
        <td align="center">
          <a href="https://service.sheltermanager.com/asmlogin" ${styles.button}>
            View in ASM
          </a>
        </td>
      </tr>
    </table>

    <div style="background-color: #f7fafc; padding: 15px; margin: 20px 0; border-radius: 4px; border: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #718096; font-size: 12px;">
        <strong>Note:</strong> A confirmation email has been automatically sent to the applicant.
        They have been informed that someone will contact them within 24-48 hours.
      </p>
    </div>
  `;

  const preheader = `New ${formLabel} from ${data.firstname || 'Unknown'} ${data.lastname || ''} - Requires review`;

  return {
    subject: `[Action Required] New ${formLabel} - ${data.firstname || 'Unknown'} ${data.lastname || ''}`,
    html: baseEmailTemplate(content, preheader),
    text: `New ${formLabel} received from ${data.firstname || 'Unknown'} ${data.lastname || ''}. Email: ${data.email || 'Not provided'}. Phone: ${data.cellphone || data.phone || 'Not provided'}. Please review in ASM and respond within 24-48 hours.`
  };
};