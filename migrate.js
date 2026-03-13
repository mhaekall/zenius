import pg from 'pg';
import fs from 'fs';

const connectionString = "postgresql://postgres:Habibiendut1.@db.lgbfrkenyxnrzycggjov.supabase.co:5432/postgres";
const poolerConnectionString = "postgresql://postgres:Habibiendut1.@db.lgbfrkenyxnrzycggjov.supabase.co:6543/postgres";
const sqlFile = "/data/data/com.termux/files/home/zenius/supabase/migrations/20260313000000_low_priority_fields.sql";

const sql = fs.readFileSync(sqlFile, 'utf8');

async function runMigration(url) {
  console.log(`Connecting to ${url.replace(/:[^:]+@/, ':****@')}...`);
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully.");
    await client.query(sql);
    console.log("Migration executed successfully.");
    return true;
  } catch (err) {
    console.error(`Error with ${url.split('@')[1]}: ${err.message}`);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  const success = await runMigration(connectionString);
  if (!success) {
    console.log("Retrying with pooler...");
    const poolerSuccess = await runMigration(poolerConnectionString);
    if (!poolerSuccess) {
      console.error("All connection attempts failed.");
      process.exit(1);
    }
  }
}

main();
