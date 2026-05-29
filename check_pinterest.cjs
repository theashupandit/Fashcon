
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function checkPinterest() {
  console.log('--- Pinterest API Token Audit ---');
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;

  if (!accessToken) {
    console.log('❌ Error: PINTEREST_ACCESS_TOKEN is missing in .env');
    process.exit(1);
  }

  try {
    console.log('Fetching Pinterest User Info (Testing Token)...');
    const res = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (res.ok) {
      console.log('✅ Pinterest API: Token is VALID and HEALTHY.');
      console.log(`   Username: ${data.username || 'N/A'}`);
      console.log(`   Account Type: ${data.account_type || 'N/A'}`);
    } else {
      console.log('❌ Pinterest API: Token is INVALID or EXPIRED.');
      console.log('   Status:', res.status);
      console.log('   Error:', data.message || JSON.stringify(data));
    }
  } catch (err) {
    console.log('❌ Pinterest API: Connection failed.', err.message);
  }

  console.log('--- Audit Complete ---');
  process.exit(0);
}

checkPinterest();
