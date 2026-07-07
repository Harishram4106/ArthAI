const { Client } = require('pg');

const regions = [
  'ap-south-1', 'ap-southeast-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'sa-east-1', 'ca-central-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-2', 'ap-east-1'
];

const password = encodeURIComponent('Harish@$123%');
const projectRef = 'ildzbyjszswzdoruulzg';

async function testRegion(region) {
  const url = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  
  return new Promise((resolve) => {
    client.connect((err) => {
      if (err) {
        console.log(`[${region}] Error: ${err.message}`);
        resolve(null);
      } else {
        client.end();
        resolve(region);
      }
    });
  });
}

async function run() {
  for (const region of regions) {
    const result = await testRegion(region);
    if (result) {
       console.log(`\n✅ FOUND EXACT REGION: ${result}`);
       process.exit(0);
    }
  }
}

run();
