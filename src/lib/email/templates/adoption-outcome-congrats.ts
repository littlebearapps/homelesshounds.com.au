/**
 * Email template for successful adoption outcome - congratulations to the winner
 */

import { baseEmailTemplate, styles, EmailData } from './base';

export const adoptionOutcomeCongratsEmail = (data: EmailData) => {
  const content = `
    <h2 ${styles.h2}>
      🎉 Congratulations${data.firstname ? `, ${data.firstname}` : ''}! Your adoption application${data.animal_name ? ` for ${data.animal_name}` : ''} has been approved!
    </h2>

    <p ${styles.p}>
      We're absolutely thrilled to let you know that your application to adopt
      <strong>${data.animal_name || 'your new pet'}</strong> has been successful!
      Welcome to the Homeless Hounds family! 🏡
    </p>

    ${data.animal_name ? `
      <div ${styles.successBox}>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="vertical-align: top; padding-right: 15px;">
              <h3 style="color: #2f855a; font-size: 16px; font-weight: 600; margin: 0 0 10px;">🐕 Your New Family Member</h3>
              <p style="margin: 0; color: #2f855a; font-size: 14px;">
                <strong>Name:</strong> ${data.animal_name}<br>
                ${data.species ? `<strong>Type:</strong> ${data.species}<br>` : ''}
                <strong>Adoption Date:</strong> ${data.adoption_date ? new Date(data.adoption_date).toLocaleDateString() : 'Today'}
              </p>
            </td>
            ${data.animal_photo ? `
            <td style="vertical-align: top; width: 120px; text-align: right;">
              <img src="${data.animal_photo}"
                   alt="Photo of ${data.animal_name}"
                   style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #2f855a;"
                   width="100" height="100" />
            </td>
            ` : ''}
          </tr>
        </table>
      </div>
    ` : ''}

    <div ${styles.infoBox}>
      <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Next Steps</h3>
      <ol style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;">
        <li><strong>Contact our team</strong> - We'll reach out to arrange pickup</li>
        <li><strong>Prepare your home</strong> - Set up food, water, and sleeping areas</li>
        <li><strong>Schedule vet check</strong> - Book a wellness check within the first week</li>
        <li><strong>Enjoy your new companion</strong> - Welcome them to their forever home!</li>
      </ol>
    </div>

    ${styles.divider}

    <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;" class="dark-mode-text">Important Information</h3>
    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 15px;" class="dark-mode-subtext">
      Our adoption coordinator will contact you within the next 24 hours to:
    </p>
    <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;" class="dark-mode-subtext">
      <li>Arrange a convenient pickup time</li>
      <li>Go over the adoption contract and fees</li>
      <li>Provide medical records and care instructions</li>
      <li>Answer any questions you may have</li>
    </ul>

    <div ${styles.warningBox}>
      <p style="margin: 0; color: #744210; font-size: 13px;">
        <strong>Please be available:</strong> Our team will call the phone number you provided on your application.
        If we can't reach you within 48 hours, we may need to consider other applicants.
      </p>
    </div>

    ${styles.divider}

    <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;" class="dark-mode-text">Welcome to the Family! 💕</h3>
    <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 15px;" class="dark-mode-subtext">
      Thank you for choosing to adopt rather than shop. You're not just gaining a pet -
      you're saving a life and making room for us to help another animal in need.
      We can't wait to see the joy ${data.animal_name || 'your new pet'} will bring to your family!
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
      <tr>
        <td align="center" style="padding: 0 10px;">
          <a href="https://homelesshounds.com.au/resources/new-pet-owner" ${styles.button}>
            New Pet Owner Guide
          </a>
        </td>
        <td align="center" style="padding: 0 10px;">
          <a href="https://homelesshounds.com.au/contact-us" style="display: inline-block; padding: 12px 24px; background: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #667eea;">
            Contact Us
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #718096; font-size: 13px; margin: 20px 0 0;">
      With heartfelt congratulations,<br>
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

  const preheader = `🎉 Your adoption application has been approved! Welcome to the Homeless Hounds family.`;

  return {
    subject: `🎉 Adoption Approved - Welcome ${data.animal_name || 'Your New Pet'} Home! | Homeless Hounds`,
    html: baseEmailTemplate(content, preheader),
    text: `Congratulations${data.firstname ? ` ${data.firstname}` : ''}! Your adoption application for ${data.animal_name || 'your new pet'} has been approved. Our team will contact you within 24 hours to arrange pickup. Thank you for choosing to adopt! - Homeless Hounds Team`
  };
};