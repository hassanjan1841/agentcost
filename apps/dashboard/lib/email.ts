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
