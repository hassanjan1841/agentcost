/**
 * Unified Email Sender
 * Uses Resend as primary (production), falls back to Nodemailer (development)
 * Production-ready with proper error handling and logging
 */

import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'resend' | 'nodemailer' | 'console';
}

/**
 * Email configuration from environment
 */
class EmailConfig {
  private static instance: EmailConfig;

  readonly isProduction = process.env.NODE_ENV === 'production';
  readonly appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  readonly fromEmail = process.env.SMTP_FROM || 'noreply@agentcost.dev';
  readonly fromName = process.env.EMAIL_FROM_NAME || 'AgentCost';
  
  readonly resendApiKey = process.env.RESEND_API_KEY || '';
  readonly useResend = !!this.resendApiKey;

  readonly smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    secure: (process.env.SMTP_PORT || '587') === '465',
  };

  readonly useNodemailer = !!(
    this.smtpConfig.host &&
    this.smtpConfig.user &&
    this.smtpConfig.password
  );

  private nodemailerTransporter: nodemailer.Transporter | null = null;

  private constructor() {}

  static getInstance(): EmailConfig {
    if (!EmailConfig.instance) {
      EmailConfig.instance = new EmailConfig();
    }
    return EmailConfig.instance;
  }

  getTransporter(): nodemailer.Transporter | null {
    if (!this.useNodemailer) return null;

    if (!this.nodemailerTransporter) {
      this.nodemailerTransporter = nodemailer.createTransport({
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        secure: this.smtpConfig.secure,
        auth: {
          user: this.smtpConfig.user,
          pass: this.smtpConfig.password,
        },
      });
    }

    return this.nodemailerTransporter;
  }

  logConfig(): void {
    console.log('📧 Email Configuration:');
    console.log(`  ├─ Provider: ${this.useResend ? 'Resend ✅' : 'Resend ❌'}`);
    console.log(`  ├─ Fallback: ${this.useNodemailer ? 'Nodemailer ✅' : 'Nodemailer ❌'}`);
    console.log(`  ├─ Console: Always Available`);
    console.log(`  ├─ From: ${this.fromName} <${this.fromEmail}>`);
    console.log(`  └─ App URL: ${this.appUrl}`);
  }
}

/**
 * Send email via Resend API
 */
async function sendViaResend(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const config = EmailConfig.getInstance();
    if (!config.resendApiKey) {
      return {
        success: false,
        error: 'Resend API key not configured',
        provider: 'resend',
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Resend API error:', error);
      return {
        success: false,
        error: `Resend API: ${error.message || 'Unknown error'}`,
        provider: 'resend',
      };
    }

    const data = await response.json();
    console.log('✅ Email sent via Resend:', {
      to: options.to,
      subject: options.subject,
      messageId: data.id,
    });

    return {
      success: true,
      messageId: data.id,
      provider: 'resend',
    };
  } catch (error) {
    console.error('❌ Resend send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'resend',
    };
  }
}

/**
 * Send email via Nodemailer SMTP
 */
async function sendViaNodemailer(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const config = EmailConfig.getInstance();
    const transporter = config.getTransporter();

    if (!transporter) {
      return {
        success: false,
        error: 'Nodemailer SMTP not configured',
        provider: 'nodemailer',
      };
    }

    const info = await transporter.sendMail({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    console.log('✅ Email sent via Nodemailer:', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });

    return {
      success: true,
      messageId: info.messageId,
      provider: 'nodemailer',
    };
  } catch (error) {
    console.error('❌ Nodemailer send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'nodemailer',
    };
  }
}

/**
 * Fallback: Log email to console (development)
 */
function logEmailToConsole(options: SendEmailOptions): SendEmailResult {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`
📧 EMAIL (Logged to console - no provider available)
────────────────────────────────────────────
To:       ${options.to}
Subject:  ${options.subject}
─────────────────────────────────────────────
[HTML Email Content - ${options.html.length} bytes]
─────────────────────────────────────────────
Message ID: ${messageId}
Timestamp:  ${new Date().toISOString()}
────────────────────────────────────────────
  `);

  return {
    success: true,
    messageId,
    provider: 'console',
  };
}

/**
 * Main email sender function
 * Tries Resend first, falls back to Nodemailer, then console logging
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const config = EmailConfig.getInstance();

  // Validate email format
  if (!options.to || !options.to.includes('@')) {
    return {
      success: false,
      error: `Invalid recipient email: ${options.to}`,
    };
  }

  // Try Resend first (production)
  if (config.useResend) {
    const result = await sendViaResend(options);
    if (result.success) {
      return result;
    }
    console.warn('⚠️  Resend failed, trying fallback...');
  }

  // Try Nodemailer second (fallback)
  if (config.useNodemailer) {
    const result = await sendViaNodemailer(options);
    if (result.success) {
      return result;
    }
    console.warn('⚠️  Nodemailer failed, logging to console...');
  }

  // Fallback to console logging
  return logEmailToConsole(options);
}

/**
 * Helper: Send email with template
 */
export async function sendEmailWithTemplate(
  to: string,
  subject: string,
  htmlTemplate: string,
  replyTo?: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject,
    html: htmlTemplate,
    replyTo,
  });
}

/**
 * Get email configuration (for debugging)
 */
export function getEmailConfig() {
  const config = EmailConfig.getInstance();
  return {
    isProduction: config.isProduction,
    hasResend: config.useResend,
    hasNodemailer: config.useNodemailer,
    fromEmail: config.fromEmail,
    fromName: config.fromName,
    appUrl: config.appUrl,
  };
}

/**
 * Log email configuration on startup
 */
export function logEmailSetup(): void {
  EmailConfig.getInstance().logConfig();
}
