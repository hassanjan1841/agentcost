import { sql } from '@vercel/postgres';

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  try {
    // Get demo project
    const project = await sql`
      SELECT id FROM projects WHERE api_key = 'ak_demo_test_key_123'
    `;

    if (project.rows.length === 0) {
      console.log('❌ Demo project not found');
      return;
    }

    const projectId = project.rows[0].id;

    // Insert mock events
    const events = [
      {
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        inputTokens: 150,
        outputTokens: 300,
        cost: 0.00195, // (150/1M)*3 + (300/1M)*15
        duration: 1234,
        timestamp: Date.now() - 1000 * 60 * 30, // 30 min ago
      },
      {
        provider: 'openai',
        model: 'gpt-4-turbo',
        inputTokens: 200,
        outputTokens: 400,
        cost: 0.014, // (200/1M)*10 + (400/1M)*30
        duration: 2345,
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      },
      {
        provider: 'google',
        model: 'gemini-pro',
        inputTokens: 100,
        outputTokens: 150,
        cost: 0.00006875, // (100/1M)*0.125 + (150/1M)*0.375
        duration: 987,
        timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
      },
    ];

    for (const event of events) {
      await sql`
        INSERT INTO events (
          project_id, provider, model, input_tokens, 
          output_tokens, cost, duration, timestamp
        )
        VALUES (
          ${projectId}, ${event.provider}, ${event.model},
          ${event.inputTokens}, ${event.outputTokens}, ${event.cost},
          ${event.duration}, ${event.timestamp}
        )
      `;
    }

    console.log('✅ Seeded', events.length, 'demo events');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedDemoData();
