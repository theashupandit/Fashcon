
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function checkPageSpeed() {
  console.log('--- PageSpeed Insights API Audit ---');
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    console.log('❌ Error: PAGESPEED_API_KEY is missing in .env');
    process.exit(1);
  }

  const testUrl = 'https://www.google.com';
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&key=${apiKey}&strategy=mobile`;

  try {
    console.log(`Testing API Key with URL: ${testUrl}...`);
    const res = await fetch(psiUrl);
    const data = await res.json();

    if (res.ok && data.lighthouseResult) {
      console.log('✅ PageSpeed Insights: Connected successfully.');
      console.log(`   Performance Score: ${data.lighthouseResult.categories.performance.score * 100}`);
    } else {
      console.log('❌ PageSpeed Insights: Connection failed.');
      console.log('   Error:', data.error ? data.error.message : 'Unknown error');
    }
  } catch (err) {
    console.log('❌ PageSpeed Insights: Network error.', err.message);
  }

  console.log('--- Audit Complete ---');
  process.exit(0);
}

checkPageSpeed();
