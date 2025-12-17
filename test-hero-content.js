// test-hero-content.js
require('dotenv').config();
const { getHomeHeroContent } = require('./src/lib/db-actions');

async function testHeroContent() {
  try {
    console.log('Testing getHomeHeroContent function...');
    const heroData = await getHomeHeroContent();
    console.log('Hero data returned:', JSON.stringify(heroData, null, 2));
  } catch (error) {
    console.error('Error in getHomeHeroContent:', error);
  }
}

testHeroContent();