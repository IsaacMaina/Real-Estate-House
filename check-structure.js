// check-structure.js
const { Client } = require('pg');
require('dotenv').config();

async function checkTableStructure() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Checking structure of pages table...');

    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'pages'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in pages table:');
    result.rows.forEach(col => {
      console.log(' -', col.column_name, ':', col.data_type);
    });

    console.log('\nChecking structure of content_images table...');
    const result2 = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'content_images'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in content_images table:');
    result2.rows.forEach(col => {
      console.log(' -', col.column_name, ':', col.data_type);
    });

    console.log('\nChecking structure of alerts table...');
    const result3 = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'alerts'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in alerts table:');
    result3.rows.forEach(col => {
      console.log(' -', col.column_name, ':', col.data_type);
    });

    console.log('\nChecking structure of logs table...');
    const result4 = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'logs'
      ORDER BY ordinal_position;
    `);

    console.log('Columns in logs table:');
    result4.rows.forEach(col => {
      console.log(' -', col.column_name, ':', col.data_type);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkTableStructure();