// check-and-create-tables.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function checkAndCreateTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if users table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) AS table_exists;
    `);
    
    console.log('Users table exists:', result.rows[0].table_exists);
    
    if (!result.rows[0].table_exists) {
      console.log('Users table does not exist. Creating all tables...');
      const schema = fs.readFileSync('db_schema.sql', 'utf8');
      
      // Split and execute each statement separately
      const statements = schema.split(/;\s*(?=\n|$)/).filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim() && !statement.trim().startsWith('--')) {
          try {
            await client.query(statement);
            console.log(`Executed statement: ${statement.substring(0, 50)}...`);
          } catch (stmtErr) {
            // Skip errors like "extension already exists" or "role already exists"
            if (!stmtErr.message.includes('already exists') && !stmtErr.message.includes('already installed')) {
              console.error(`Error executing statement: ${stmtErr.message}`);
              console.log(`Statement: ${statement}`);
            } else {
              console.log(`Ignored error for statement (likely already exists): ${statement.substring(0, 50)}...`);
            }
          }
        }
      }
      
      console.log('All tables created successfully!');
    } else {
      console.log('Tables already exist.');
    }
    
  } catch (err) {
    console.error('Error in checkAndCreateTables:', err.message);
  } finally {
    await client.end();
  }
}

checkAndCreateTables();