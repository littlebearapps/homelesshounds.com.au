/**
 * Base email template with consistent styling
 * Uses inline styles for maximum email client compatibility
 */

export interface EmailData {
  firstname?: string;
  lastname?: string;
  email?: string;
  [key: string]: any;
}

export const baseEmailTemplate = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Homeless Hounds</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media (prefers-color-scheme: dark) {
      .dark-mode-text { color: #f7fafc !important; }
      .dark-mode-subtext { color: #e2e8f0 !important; }
      .dark-mode-bg { background-color: #1a202c !important; }
      .dark-mode-card { background-color: #2d3748 !important; }
      .dark-mode-footer { background-color: #2d3748 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc; color: #2d3748;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</div>` : ''}

  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7fafc;" class="dark-mode-bg">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Email Content -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;" class="dark-mode-card">

          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #8B5CF6; padding: 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <img src="https://homelesshounds-com-au.pages.dev/hh-logo.png"
                         alt="Homeless Hounds"
                         width="180"
                         style="display: block; max-width: 180px; width: 100%; height: auto; margin: 0 auto 20px;"
                    />
                    <!-- Tagline -->
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500;">
                      Homeless Hounds Animal Rescue
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;" class="dark-mode-card">
              <div class="dark-mode-text">
                ${content}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;" class="dark-mode-footer">
              <p style="margin: 0 0 10px; color: #718096; font-size: 14px; font-weight: 600;" class="dark-mode-subtext">
                Homeless Hounds Animal Rescue
              </p>
              <p style="margin: 0 0 10px; color: #718096; font-size: 12px;" class="dark-mode-subtext">
                <a href="https://homelesshounds.com.au" style="color: #8B5CF6; text-decoration: none;">homelesshounds.com.au</a>
              </p>

              <!-- ABN and Charity Registration -->
              <p style="margin: 0 0 5px; color: #718096; font-size: 11px;" class="dark-mode-subtext">
                ABN: 93 136 291 221
              </p>
              <p style="margin: 0 0 15px; color: #718096; font-size: 11px;" class="dark-mode-subtext">
                Registered charity with the ACNC
              </p>

              <p style="margin: 0 0 10px; color: #a0aec0; font-size: 11px;" class="dark-mode-subtext">
                © ${new Date().getFullYear()} Homeless Hounds. All rights reserved.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 10px;" class="dark-mode-subtext">
                This email was sent to you because you submitted a form on our website.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

// Common email styling helpers - Updated for better dark mode support
export const styles = {
  h2: 'style="color: #2d3748; font-size: 20px; font-weight: 600; margin: 0 0 20px;" class="dark-mode-text"',
  h3: 'style="color: #4a5568; font-size: 16px; font-weight: 600; margin: 0 0 10px;" class="dark-mode-text"',
  p: 'style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 15px;" class="dark-mode-subtext"',
  button: 'style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;"',
  infoBox: 'style="background-color: #edf2f7; border-left: 4px solid #8B5CF6; padding: 15px; margin: 20px 0; border-radius: 4px;"',
  warningBox: 'style="background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 15px; margin: 20px 0; border-radius: 4px;"',
  successBox: 'style="background-color: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0; border-radius: 4px;"',
  list: 'style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0 0 15px; padding-left: 20px;" class="dark-mode-subtext"',
  divider: '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">',
};