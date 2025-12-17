// update-pages-columns.js
const { Client } = require('pg');
require('dotenv').config();

async function updatePagesTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if the hero columns already exist
    const checkColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'pages'
      AND column_name IN ('hero_title', 'hero_subtitle', 'hero_description', 'hero_image_url');
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('Existing hero columns:', existingColumns);

    // Add hero_title column if it doesn't exist
    if (!existingColumns.includes('hero_title')) {
      await client.query('ALTER TABLE pages ADD COLUMN hero_title TEXT;');
      console.log('Added hero_title column');
    } else {
      console.log('hero_title column already exists');
    }

    // Add hero_subtitle column if it doesn't exist
    if (!existingColumns.includes('hero_subtitle')) {
      await client.query('ALTER TABLE pages ADD COLUMN hero_subtitle TEXT;');
      console.log('Added hero_subtitle column');
    } else {
      console.log('hero_subtitle column already exists');
    }

    // Add hero_description column if it doesn't exist
    if (!existingColumns.includes('hero_description')) {
      await client.query('ALTER TABLE pages ADD COLUMN hero_description TEXT;');
      console.log('Added hero_description column');
    } else {
      console.log('hero_description column already exists');
    }

    // Add hero_image_url column if it doesn't exist
    if (!existingColumns.includes('hero_image_url')) {
      await client.query('ALTER TABLE pages ADD COLUMN hero_image_url TEXT;');
      console.log('Added hero_image_url column');
    } else {
      console.log('hero_image_url column already exists');
    }

    // Update the status column to add the new check constraint if needed
    await client.query(`
      ALTER TABLE pages 
      DROP CONSTRAINT IF EXISTS pages_status_check,
      ADD CONSTRAINT pages_status_check CHECK (status IN ('draft', 'published', 'archived'));
    `);
    console.log('Updated status check constraint');

    console.log('\nFinal pages table structure:');
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'pages'
      ORDER BY ordinal_position;
    `);

    result.rows.forEach(col => {
      console.log(' -', col.column_name, ':', col.data_type);
    });

  } catch (err) {
    console.error('Error updating pages table:', err);
  } finally {
    await client.end();
  }
}

updatePagesTable();