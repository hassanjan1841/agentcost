import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  // Build parameterized query from template literals
  // e.g., sql`SELECT * FROM users WHERE id = ${userId}` becomes
  // "SELECT * FROM users WHERE id = $1" with values=[userId]
  
  let query = '';
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += `$${i + 1}`;
    }
  }
  
  const result = await pool.query(query, values);
  return { rows: result.rows };
}

// Helper to check if DB is initialized
export async function initializeDatabase() {
  try {
    // Check if projects table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'projects'
      );
    `;
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Database check failed:', error);
    return false;
  }
}

// Get or create demo project
export async function getDemoProject() {
  try {
    const result = await sql`
      SELECT id, name, api_key FROM projects 
      WHERE api_key = 'ak_demo_test_key_123'
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      const insert = await sql`
        INSERT INTO projects (name, api_key)
        VALUES ('Demo Project', 'ak_demo_test_key_123')
        RETURNING id, name, api_key
      `;
      return insert.rows[0];
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting demo project:', error);
    throw error;
  }
}
