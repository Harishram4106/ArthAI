const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function run() {
  console.log('Cleaning fake audit logs...');
  await prisma.auditLog.deleteMany({
    where: {
      hash: { startsWith: 'hash_' }
    }
  });
  console.log('Cleaned fake audit logs.');
  
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-demo-mvp';
  
  const user = await prisma.user.findUnique({ where: { email: 'aarav@demo.com' } });
  if (!user) {
    console.log('Demo user not found');
    return;
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  // 1. Get summary to get surplus
  const sumRes = await fetch('http://localhost:3001/api/transactions/summary', { headers });
  const summary = await sumRes.json();
  const surplus = summary.investableSurplus;
  console.log('Surplus:', surplus);

  // 2. Submit risk assessment to ensure we have a profile
  const answers = {
    age: '30-45',       // 3
    income: 'stable',   // 3
    goal: 'grow',       // 4
    horizon: '7+',      // 4
    reaction: 'investMore', // 4
    experience: 'experienced' // 3
  }; // Total 21 -> Aggressive
  await fetch('http://localhost:3001/api/risk/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({ answers })
  });
  console.log('Risk profile generated.');

  // 3. Generate advisory plan
  const planRes = await fetch('http://localhost:3001/api/recommendations/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ surplus })
  });
  const plan = await planRes.json();
  console.log('Generated Plan for Aarav:');
  console.log(JSON.stringify(plan, null, 2));

  // 4. Consent to it
  await fetch('http://localhost:3001/api/recommendations/consent', {
    method: 'POST',
    headers,
    body: JSON.stringify({ portfolioId: plan.id })
  });
  console.log('Consented to plan.');

  process.exit(0);
}

run().catch(console.error);
