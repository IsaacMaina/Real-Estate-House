// initialize-basic-pages.js
const { Client } = require('pg');
require('dotenv').config();

async function initializeBasicPages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if pages exist, if not create them
    const pages = [
      { 
        title: 'Homepage', 
        slug: '/', 
        content: 'Welcome to our premium real estate website',
        hero_title: 'Find Your Dream Home in Kenya',
        hero_subtitle: 'Premium Properties Across Kenya',
        hero_description: 'Discover the finest luxury homes with beautiful imagery and smooth animations. We connect discerning buyers with exceptional properties.',
        hero_image_url: '/img16.jpg',
        status: 'published'
      },
      { 
        title: 'About Us', 
        slug: '/about', 
        content: 'Learn more about our company and mission',
        status: 'published'
      },
      { 
        title: 'Our Services', 
        slug: '/services', 
        content: 'Explore our comprehensive real estate services',
        status: 'published'
      },
      { 
        title: 'Contact Us', 
        slug: '/contact', 
        content: 'Get in touch with our team',
        status: 'published'
      }
    ];

    for (const page of pages) {
      const existing = await client.query(
        'SELECT id FROM pages WHERE slug = $1', 
        [page.slug]
      );

      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO pages (
            title, 
            slug, 
            content, 
            hero_title, 
            hero_subtitle, 
            hero_description, 
            hero_image_url, 
            status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          page.title,
          page.slug,
          page.content,
          page.hero_title || null,
          page.hero_subtitle || null,
          page.hero_description || null,
          page.hero_image_url || null,
          page.status
        ]);

        console.log(`Created page: ${page.title}`);
      } else {
        console.log(`Page already exists: ${page.title}`);
      }
    }

    console.log('Basic pages initialization completed!');
  } catch (error) {
    console.error('Error initializing basic pages:', error);
  } finally {
    await client.end();
  }
}

async function runInitialization() {
  try {
    console.log('Initializing basic pages...');
    await initializeBasicPages();
    console.log('Basic pages initialized successfully!');
  } catch (error) {
    console.error('Error initializing basic pages:', error);
  }
}

runInitialization();