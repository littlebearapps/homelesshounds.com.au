/**
 * Email template for pet courier application confirmation
 */

import { baseEmailTemplate, styles, EmailData } from './base';

export const petCourierConfirmationEmail = (data: EmailData) => {
  const content = `
    <h2 ${styles.h2}>
      Thank you${data.firstname ? `, ${data.firstname}` : ''} for volunteering as a Pet Courier!
    </h2>

    <p ${styles.p}>
      We're excited about your offer to help transport rescue animals! Your application to become
      a pet courier has been received and our transport co-ordination team will review it shortly.
    </p>

    <div ${styles.infoBox}>
      <h3 style="color: #2d3748; font-size: 16px; font-weight: 600; margin: 0 0 10px;">What Happens Next?</h3>
      <ol style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;">
        <li><strong>Application Review</strong> (24-48 hours) - We'll review your details and availability</li>
        <li><strong>Verification</strong> - We'll verify your driver's licence and insurance details</li>
        <li><strong>Welcome Pack</strong> - You'll receive our transport guidelines and safety information</li>
        <li><strong>Transport Alerts</strong> - We'll notify you when transport is needed in your area</li>
      </ol>
    </div>

    <div ${styles.successBox}>
      <h3 style="color: #2f855a; font-size: 16px; font-weight: 600; margin: 0 0 10px;">How Pet Transport Works</h3>
      <ul style="margin: 0; color: #2f855a; font-size: 14px; padding-left: 20px;">
        <li>We match transport needs with your availability and routes</li>
        <li>All transport is voluntary - you choose when to help</li>
        <li>We provide carriers and supplies when needed</li>
        <li>Fuel costs can be reimbursed upon request</li>
        <li>You're covered by our volunteer insurance</li>
      </ul>
    </div>

    <p ${styles.p}>
      <strong>Flexible Commitment:</strong> There's no minimum commitment required. You can help
      whenever it suits your schedule - whether it's a regular route or occasional trips.
    </p>

    <p ${styles.p}>
      Pet transport makes a huge difference in saving lives by helping animals reach foster homes,
      veterinary appointments, and their forever families. Thank you for being part of this lifesaving network!
    </p>

    <p ${styles.p}>
      If you have any questions, please contact our transport co-ordinator at
      <a href="mailto:transport@homelesshounds.com.au" style="color: #7b47d1;">transport@homelesshounds.com.au</a>
    </p>
  `;

  const preheader = `Thank you for volunteering as a pet courier. Our transport team will review your application.`;

  return {
    subject: 'Pet Courier Application Received - Thank You | Homeless Hounds',
    html: baseEmailTemplate(content, preheader),
    text: `Thank you${data.firstname ? ` ${data.firstname}` : ''} for volunteering as a Pet Courier! We're excited about your offer to help transport rescue animals. Our transport co-ordination team will review your application and contact you within 24-48 hours. Visit https://homelesshounds.com.au for more information.`
  };
};