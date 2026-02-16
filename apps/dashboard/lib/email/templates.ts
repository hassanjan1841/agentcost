/**
 * Reusable Email Templates
 * Centralized HTML email templates to avoid code duplication
 */

interface EmailTemplateProps {
  recipientName?: string;
  actionUrl?: string;
  actionText?: string;
  expiresIn?: string;
  supportText?: string;
  footerText?: string;
}

/**
 * Base email layout wrapper
 * All emails use this for consistent styling
 */
function emailLayout(content: string, footerText?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; color: white; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { background: #f5f5f5; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .code-block { background: #eee; padding: 15px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 15px 0; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .alert-icon { color: #856404; font-weight: bold; }
        .alert-text { color: #856404; margin: 0; }
        .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        .divider { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
        h2 { color: #333; margin-top: 20px; }
        p { color: #555; margin: 10px 0; }
        a { color: #667eea; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        ${content}
        <div class="footer">
          ${footerText || '© 2026 AgentCost. All rights reserved.'}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email header component
 */
function emailHeader(title: string, icon: string = ''): string {
  return `
    <div class="header">
      <h1>${icon} ${title}</h1>
    </div>
  `;
}

/**
 * Email action button
 */
function actionButton(url: string, text: string): string {
  return `<a href="${url}" class="button">${text}</a>`;
}

/**
 * Code/link display
 */
function codeBlock(content: string): string {
  return `<div class="code-block">${content}</div>`;
}

/**
 * Alert box
 */
function alertBox(text: string, icon: string = '⚠️'): string {
  return `
    <div class="alert">
      <p class="alert-text"><span class="alert-icon">${icon}</span> <strong>${text}</strong></p>
    </div>
  `;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Email verification template
 */
export function verificationEmailTemplate(verificationUrl: string, recipientName?: string): string {
  const bodyContent = `
    ${emailHeader('Welcome to AgentCost!', '🚀')}
    <div class="body">
      <p>Hi ${recipientName || 'there'},</p>
      
      <p>Thank you for signing up! Please verify your email address to activate your account.</p>
      
      <div style="text-align: center;">
        ${actionButton(verificationUrl, 'Verify Email')}
      </div>
      
      <p>Or copy and paste this link:</p>
      ${codeBlock(verificationUrl)}
      
      ${alertBox('This link expires in 24 hours.', '⏰')}
      
      <p style="font-size: 13px; color: #999;">
        If you didn't create this account, please ignore this email.
      </p>
    </div>
  `;
  
  return emailLayout(bodyContent);
}

/**
 * Password reset template
 */
export function passwordResetEmailTemplate(resetUrl: string, recipientName?: string): string {
  const bodyContent = `
    ${emailHeader('Password Reset Request', '🔐')}
    <div class="body">
      <p>Hi ${recipientName || 'there'},</p>
      
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      
      <div style="text-align: center;">
        ${actionButton(resetUrl, 'Reset Password')}
      </div>
      
      <p>Or copy and paste this link:</p>
      ${codeBlock(resetUrl)}
      
      ${alertBox('This link expires in 1 hour.', '⏰')}
      
      <p style="font-size: 13px; color: #999;">
        If you didn't request a password reset, you can safely ignore this email. Never share this link with anyone.
      </p>
    </div>
  `;
  
  return emailLayout(bodyContent);
}

/**
 * Welcome email template
 */
export function welcomeEmailTemplate(recipientName: string, dashboardUrl: string): string {
  const bodyContent = `
    ${emailHeader('Welcome to AgentCost!', '🎉')}
    <div class="body">
      <p>Hi ${recipientName},</p>
      
      <p>Your account is all set! You're now ready to start tracking your AI API costs in real-time.</p>
      
      <h2>Next Steps:</h2>
      <ol>
        <li>Create your first project</li>
        <li>Generate an API key for your project</li>
        <li>Install the AgentCost SDK in your application</li>
        <li>Start tracking costs automatically!</li>
      </ol>
      
      <div style="text-align: center;">
        ${actionButton(dashboardUrl, 'Go to Dashboard')}
      </div>
      
      <p style="font-size: 13px; color: #999;">
        Have questions? Check out our documentation or reach out to our support team.
      </p>
    </div>
  `;
  
  return emailLayout(bodyContent);
}

/**
 * Budget alert template
 */
export function budgetAlertEmailTemplate(
  projectName: string,
  spent: number,
  limit: number,
  percentage: number,
  dashboardUrl: string,
  recipientName?: string
): string {
  const percentageColor = percentage >= 100 ? '#f5576c' : percentage >= 80 ? '#ff9800' : '#4caf50';
  
  const bodyContent = `
    ${emailHeader('Budget Alert', '⚠️')}
    <div class="body">
      <p>Hi ${recipientName || 'there'},</p>
      
      <p>Your project <strong>"${projectName}"</strong> has reached <strong>${percentage}%</strong> of its monthly budget.</p>
      
      <div style="background: white; border: 2px solid ${percentageColor}; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Spent:</span>
          <strong style="color: ${percentageColor}; font-size: 18px;">$${spent.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <span style="color: #666;">Budget Limit:</span>
          <strong style="color: #333; font-size: 18px;">$${limit.toFixed(2)}</strong>
        </div>
        <div style="background: #f0f0f0; border-radius: 4px; height: 20px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #4caf50 0%, ${percentageColor} 100%); height: 100%; width: ${Math.min(percentage, 100)}%;"></div>
        </div>
      </div>
      
      <div style="text-align: center;">
        ${actionButton(dashboardUrl, 'View Dashboard')}
      </div>
      
      <p style="font-size: 13px; color: #999;">
        To adjust your budget limit or disable alerts, visit your project settings.
      </p>
    </div>
  `;
  
  return emailLayout(bodyContent, 'You\'re receiving this email because budget alerts are enabled for this project.');
}

/**
 * Account activity template (for login notifications, etc.)
 */
export function activityEmailTemplate(
  activityType: 'new_login' | 'password_changed' | 'email_changed',
  timestamp: Date,
  ipAddress: string,
  recipientName?: string
): string {
  const messages = {
    new_login: 'A new login to your account was detected',
    password_changed: 'Your account password was changed',
    email_changed: 'Your account email was changed',
  };
  
  const icons = {
    new_login: '🔓',
    password_changed: '🔑',
    email_changed: '📧',
  };

  const bodyContent = `
    ${emailHeader('Account Activity', icons[activityType])}
    <div class="body">
      <p>Hi ${recipientName || 'there'},</p>
      
      <p>${messages[activityType]}.</p>
      
      <div style="background: #f0f0f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Activity:</strong> ${messages[activityType]}</p>
        <p style="margin: 5px 0;"><strong>Date/Time:</strong> ${timestamp.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
      </div>
      
      ${
        activityType === 'new_login'
          ? alertBox('If this wasn\'t you, please change your password immediately.', '🚨')
          : alertBox('If you didn\'t make this change, contact support immediately.', '🚨')
      }
      
      <p style="font-size: 13px; color: #999;">
        For security, we recommend reviewing your recent activity in your account settings.
      </p>
    </div>
  `;
  
  return emailLayout(bodyContent);
}

/**
 * Generic transactional email template
 * Use for custom emails
 */
export function transactionalEmailTemplate(
  title: string,
  content: string,
  actionUrl?: string,
  actionText?: string,
  footerText?: string
): string {
  let action = '';
  if (actionUrl && actionText) {
    action = `
      <div style="text-align: center; margin: 30px 0;">
        ${actionButton(actionUrl, actionText)}
      </div>
    `;
  }

  const bodyContent = `
    ${emailHeader(title, '📧')}
    <div class="body">
      ${content}
      ${action}
    </div>
  `;
  
  return emailLayout(bodyContent, footerText);
}
