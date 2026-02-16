/**
 * Email Service
 * High-level API for sending different types of emails
 * Uses reusable templates and unified sender
 * No code duplication, DRY principles applied
 */

import { sendEmailWithTemplate } from './sender';
import {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  welcomeEmailTemplate,
  budgetAlertEmailTemplate,
  activityEmailTemplate,
  transactionalEmailTemplate,
} from './templates';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  fullName?: string
) {
  const verificationUrl = `${appUrl}/auth/verify?token=${token}`;
  const html = verificationEmailTemplate(verificationUrl, fullName);

  return sendEmailWithTemplate(
    email,
    '✉️ Verify your AgentCost email',
    html
  );
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  fullName?: string
) {
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
  const html = passwordResetEmailTemplate(resetUrl, fullName);

  return sendEmailWithTemplate(
    email,
    '🔐 Reset your AgentCost password',
    html
  );
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string
) {
  const dashboardUrl = `${appUrl}/dashboard`;
  const html = welcomeEmailTemplate(fullName, dashboardUrl);

  return sendEmailWithTemplate(
    email,
    '🎉 Welcome to AgentCost!',
    html
  );
}

/**
 * Send budget alert email
 */
export async function sendBudgetAlertEmail(
  email: string,
  projectName: string,
  spent: number,
  limit: number,
  percentage: number,
  fullName?: string
) {
  const dashboardUrl = `${appUrl}/dashboard`;
  const html = budgetAlertEmailTemplate(
    projectName,
    spent,
    limit,
    percentage,
    dashboardUrl,
    fullName
  );

  return sendEmailWithTemplate(
    email,
    `⚠️ ${projectName}: Budget at ${percentage}%`,
    html
  );
}

/**
 * Send account activity notification
 * Used for: new login, password change, email change
 */
export async function sendActivityNotificationEmail(
  email: string,
  activityType: 'new_login' | 'password_changed' | 'email_changed',
  timestamp: Date,
  ipAddress: string,
  fullName?: string
) {
  const html = activityEmailTemplate(activityType, timestamp, ipAddress, fullName);

  const subjectMap = {
    new_login: '🔓 New login to your account',
    password_changed: '🔑 Your password was changed',
    email_changed: '📧 Your email was changed',
  };

  return sendEmailWithTemplate(
    email,
    subjectMap[activityType],
    html
  );
}

/**
 * Send custom transactional email
 * For one-off emails not covered by other functions
 */
export async function sendTransactionalEmail(
  email: string,
  subject: string,
  content: string,
  options?: {
    actionUrl?: string;
    actionText?: string;
    footerText?: string;
  }
) {
  const html = transactionalEmailTemplate(
    subject,
    content,
    options?.actionUrl,
    options?.actionText,
    options?.footerText
  );

  return sendEmailWithTemplate(email, subject, html);
}

/**
 * Bulk send emails (for newsletters, announcements, etc.)
 * Processes one at a time to avoid rate limiting
 */
export async function sendBulkEmails(
  recipients: Array<{ email: string; name?: string }>,
  subject: string,
  htmlTemplate: string,
  delayMs: number = 100
) {
  const results = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      const result = await sendEmailWithTemplate(
        recipient.email,
        subject,
        htmlTemplate.replace(/{{name}}/g, recipient.name || 'User')
      );
      
      results.push({
        email: recipient.email,
        success: result.success,
        error: result.error,
      });

      // Add delay to avoid rate limiting
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.push({
        email: recipient.email,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    total: recipients.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
}

/**
 * Test email functionality (for development/debugging)
 */
export async function testEmail(testEmail: string) {
  const html = transactionalEmailTemplate(
    'Test Email',
    `
      <p>This is a test email to verify your email configuration is working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p>If you received this email, your email service is properly configured!</p>
    `
  );

  return sendEmailWithTemplate(testEmail, '🧪 AgentCost Email Test', html);
}
