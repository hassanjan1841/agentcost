/**
 * Email Service - Main Export
 * Unified API for all email functionality
 */

// Re-export everything from service
export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendBudgetAlertEmail,
  sendActivityNotificationEmail,
  sendTransactionalEmail,
  sendBulkEmails,
  testEmail,
} from './service';

// Re-export sender utilities
export {
  sendEmail,
  sendEmailWithTemplate,
  getEmailConfig,
  logEmailSetup,
} from './sender';

// Re-export templates (for custom usage)
export {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  welcomeEmailTemplate,
  budgetAlertEmailTemplate,
  activityEmailTemplate,
  transactionalEmailTemplate,
} from './templates';

// Type exports
export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'resend' | 'nodemailer' | 'console';
};
