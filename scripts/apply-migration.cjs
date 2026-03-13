const { Client } = require('pg');

const sql = `
-- Add social media and announcement columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_username TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS tiktok_username TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS announcement TEXT;
`;

async function runMigration() {
  const client = new Client({
    connectionString: "postgresql://postgres:Habibiendut1.@db.lgbfrkenyxnrzycggjov.supabase.co:5432/postgres?sslmode=require",
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');
    
    await client.query(sql);
    console.log('Migration successful: Columns added to stores table');
    
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
