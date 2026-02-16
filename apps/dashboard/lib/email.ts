// Email service (using Resend or simple webhook approach)
// For MVP, we'll use a simple logging approach that can be replaced with real email service

export interface AlertEmail {
  to: string;
  subject: string;
  body: string;
}

export async function sendAlertEmail(email: AlertEmail) {
  // For demo, log to console (replace with real email service later)
  console.log('📧 EMAIL ALERT:', {
    to: email.to,
    subject: email.subject,
    body: email.body,
  });

  // In production, use Resend, SendGrid, or similar:
  // const response = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     from: 'alerts@agentcost.dev',
  //     to: email.to,
  //     subject: email.subject,
  //     html: email.body,
  //   }),
  // });

  return { success: true };
}

export async function sendVerificationEmail(email: string, token: string, fullName?: string) {
   const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
   return sendAlertEmail({
     to: email,
     subject: 'Verify your email - AgentCost',
     body: `Hi ${fullName || 'there'},<br><br>Please verify your email by clicking <a href="${verifyUrl}">here</a>.<br><br>This link expires in 24 hours.`,
   });
 }

export async function sendPasswordResetEmail(email: string, token: string, fullName?: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  return sendAlertEmail({
    to: email,
    subject: 'Reset your password - AgentCost',
    body: `Hi ${fullName || 'there'},<br><br>Reset your password by clicking <a href="${resetUrl}">here</a>.<br><br>This link expires in 1 hour.`,
  });
}

export async function sendWelcomeEmail(email: string, fullName: string) {
  return sendAlertEmail({
    to: email,
    subject: 'Welcome to AgentCost!',
    body: `Hi ${fullName},<br><br>Welcome to AgentCost! Your account is ready to use.`,
  });
}

export async function sendWebhook(url: string, data: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return { success: response.ok };
  } catch (error) {
    console.error('Webhook failed:', error);
    return { success: false };
  }
}
