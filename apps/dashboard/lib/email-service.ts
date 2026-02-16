import nodemailer from 'nodemailer';

/**
 * Email service using nodemailer
 * Supports SMTP configuration via environment variables
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Create nodemailer transporter
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    console.warn('⚠️  Email service not configured. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Use TLS if port is 465
    auth: {
      user,
      pass: password,
    },
  });
}

/**
 * Send email
 * Falls back to console logging if SMTP not configured
 */
async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'noreply@agentcost.dev';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!transporter) {
    // Fallback: Log to console for development
    console.log('📧 EMAIL (not sent - SMTP not configured):', {
      from,
      to: options.to,
      subject: options.subject,
      appUrl,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('✅ Email sent:', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return { success: false };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Welcome to AgentCost! 🚀</h1>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="color: #333; font-size: 16px;">Hi there,</p>
        
        <p style="color: #555; line-height: 1.6;">
          Thank you for signing up! Please verify your email address to activate your account.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
          ">Verify Email</a>
        </div>
        
        <p style="color: #888; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <code style="background: #eee; padding: 8px; border-radius: 4px; display: block; word-break: break-all; margin: 10px 0;">
            ${verificationUrl}
          </code>
        </p>
        
        <p style="color: #888; font-size: 13px; margin-top: 20px;">
          This link expires in 24 hours.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '✉️ Verify your AgentCost email',
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Password Reset Request 🔐</h1>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="color: #333; font-size: 16px;">Hi there,</p>
        
        <p style="color: #555; line-height: 1.6;">
          We received a request to reset your password. Click the button below to reset it.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
          ">Reset Password</a>
        </div>
        
        <p style="color: #888; font-size: 14px;">
          Or copy and paste this link:<br>
          <code style="background: #eee; padding: 8px; border-radius: 4px; display: block; word-break: break-all; margin: 10px 0;">
            ${resetUrl}
          </code>
        </p>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>⚠️ This link expires in 1 hour.</strong>
          </p>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email or contact support.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          For security reasons, never share this link with anyone.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '🔐 Reset your AgentCost password',
    html,
  });
}

/**
 * Send budget alert email
 */
export async function sendBudgetAlertEmail(
  email: string,
  projectName: string,
  spent: number,
  limit: number,
  percentage: number
): Promise<{ success: boolean }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardUrl = `${appUrl}/dashboard`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">⚠️ Budget Alert</h1>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="color: #333; font-size: 16px;">Hi there,</p>
        
        <p style="color: #555; line-height: 1.6;">
          Your project <strong>"${projectName}"</strong> has reached <strong>${percentage}%</strong> of its monthly budget.
        </p>
        
        <div style="background: white; border: 2px solid #f5576c; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #666;">Spent:</span>
            <strong style="color: #f5576c; font-size: 18px;">$${spent.toFixed(2)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #666;">Budget Limit:</span>
            <strong style="color: #333; font-size: 18px;">$${limit.toFixed(2)}</strong>
          </div>
          <div style="background: #f0f0f0; border-radius: 4px; height: 20px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); height: 100%; width: ${percentage}%;"></div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
          ">View Dashboard</a>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 14px;">
          To adjust your budget limit or disable alerts, visit your project settings in the dashboard.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          You're receiving this email because budget alerts are enabled for this project.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `⚠️ ${projectName}: Budget at ${percentage}%`,
    html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, fullName: string): Promise<{ success: boolean }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Welcome to AgentCost, ${fullName}! 🎉</h1>
      </div>
      
      <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="color: #333; font-size: 16px;">Hi ${fullName},</p>
        
        <p style="color: #555; line-height: 1.6;">
          Your account is all set! You're now ready to start tracking your AI API costs in real-time.
        </p>
        
        <h3 style="color: #333; margin-top: 30px;">Next Steps:</h3>
        <ol style="color: #555; line-height: 1.8;">
          <li>Create your first project</li>
          <li>Generate an API key for your project</li>
          <li>Install the AgentCost SDK in your application</li>
          <li>Start tracking costs automatically!</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/dashboard" style="
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
          ">Go to Dashboard</a>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 14px;">
          Have questions? Check out our documentation or reach out to our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; margin: 0;">
          © 2026 AgentCost. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: '🎉 Welcome to AgentCost!',
    html,
  });
}
