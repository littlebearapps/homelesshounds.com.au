/**
 * Email template for foster application confirmation
 */

import { baseEmailTemplate, styles, EmailData } from './base';

export const fosterConfirmationEmail = (data: EmailData) => {
  const content = `
    <h2 ${styles.h2}>
      Thank you${data.firstname ? `, ${data.firstname}` : ''} for offering to foster!
    </h2>

    <p ${styles.p}>
      We're thrilled about your interest in becoming a foster carer! Your application has been received
      and our foster co-ordination team will review it shortly.
    </p>

    <div ${styles.infoBox}>
      <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">Foster Process Timeline</h3>
      <ol style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;">
        <li><strong>Application Review</strong> (24-48 hours) - We'll assess your application</li>
        <li><strong>Phone Interview</strong> (Within 3-5 days) - We'll call to discuss your preferences</li>
        <li><strong>Home Visit</strong> (Within 1 week) - A volunteer will visit to ensure a safe environment</li>
        <li><strong>Foster Match</strong> - We'll match you with a suitable pet based on your preferences</li>
        <li><strong>Support & Supplies</strong> - We provide food, medical care, and ongoing support</li>
      </ol>
    </div>

    <div ${styles.successBox}>
      <h3 style="color: #2f855a; font-size: 16px; font-weight: 600; margin: 0 0 10px;">What We Provide</h3>
      <ul style="margin: 0; color: #2f855a; font-size: 14px; padding-left: 20px;">
        <li>All food and supplies</li>
        <li>Complete veterinary care</li>
        <li>24/7 support from our foster team</li>
        <li>Training and behavioural support if needed</li>
      </ul>
    </div>

    <p ${styles.p}>
      <strong>Important:</strong> Foster caring is a temporary commitment. We handle all adoption
      applications and will work with you to find the perfect forever home when your foster pet is ready.
    </p>

    <p ${styles.p}>
      If you have any questions in the meantime, please don't hesitate to contact our foster team
      at <a href="mailto:foster@homelesshounds.com.au" style="color: #7b47d1;">foster@homelesshounds.com.au</a>
    </p>
  `;

  const preheader = `Thank you for your foster application. Our team will contact you within 3-5 days.`;

  return {
    subject: 'Foster Application Received - Thank You | Homeless Hounds',
    html: baseEmailTemplate(content, preheader),
    text: `Thank you${data.firstname ? ` ${data.firstname}` : ''} for offering to foster! We're thrilled about your interest in becoming a foster carer. Our foster co-ordination team will review your application and contact you within 3-5 days. Visit https://homelesshounds.com.au for more information.`
  };
};