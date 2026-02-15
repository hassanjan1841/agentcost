import { sql } from './db';
import { sendAlertEmail, sendWebhook } from './email';

export async function checkBudgets(projectId: string) {
  try {
    // Get all enabled budgets for project
    const budgets = await sql`
      SELECT 
        id, limit_amount, period, alert_threshold, 
        email, webhook_url, last_alert_sent
      FROM budgets
      WHERE project_id = ${projectId}
        AND enabled = true
    `;

    for (const budget of budgets.rows) {
      await checkSingleBudget(projectId, budget);
    }
  } catch (error) {
    console.error('Error checking budgets:', error);
  }
}

async function checkSingleBudget(projectId: string, budget: any) {
  try {
    // Calculate time range based on period
    let timeRangeHours = 24;
    if (budget.period === 'weekly') timeRangeHours = 168;
    if (budget.period === 'monthly') timeRangeHours = 720;

    const cutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

    // Get current spending
    const spending = await sql`
      SELECT COALESCE(SUM(cost), 0)::FLOAT as total
      FROM events
      WHERE project_id = ${projectId}
        AND created_at > ${cutoff.toISOString()}
    `;

    const currentSpend = spending.rows[0].total;
    const percentUsed = currentSpend / parseFloat(budget.limit_amount);

    // Check if we should alert
    if (percentUsed >= parseFloat(budget.alert_threshold)) {
      // Don't spam - only alert once per period
      const lastAlert = budget.last_alert_sent 
        ? new Date(budget.last_alert_sent) 
        : null;
      
      const shouldAlert = !lastAlert || 
        (Date.now() - lastAlert.getTime() > timeRangeHours * 60 * 60 * 1000);

      if (shouldAlert) {
        await triggerAlert(projectId, budget, currentSpend, percentUsed);
        
        // Update last alert sent
        await sql`
          UPDATE budgets
          SET last_alert_sent = NOW()
          WHERE id = ${budget.id}
        `;
      }
    }
  } catch (error) {
    console.error('Error checking single budget:', error);
  }
}

async function triggerAlert(
  projectId: string,
  budget: any,
  currentSpend: number,
  percentUsed: number
) {
  const percentDisplay = Math.round(percentUsed * 100);
  
  const message = {
    projectId,
    budgetId: budget.id,
    alert: `⚠️ ${percentDisplay}% of ${budget.period} AI budget used`,
    currentSpend: `$${currentSpend.toFixed(2)}`,
    limit: `$${budget.limit_amount}`,
    period: budget.period,
  };

  // Send email if configured
  if (budget.email) {
    await sendAlertEmail({
      to: budget.email,
      subject: message.alert,
      body: `
        <h2>${message.alert}</h2>
        <p>You've spent <strong>${message.currentSpend}</strong> of your <strong>${message.limit}</strong> ${budget.period} budget.</p>
        <p>This is ${percentDisplay}% of your limit.</p>
        <p><a href="https://agentcost.dev/dashboard">View Dashboard</a></p>
      `,
    });
  }

  // Send webhook if configured
  if (budget.webhook_url) {
    await sendWebhook(budget.webhook_url, message);
  }

  console.log('🚨 Budget alert triggered:', message);
}
