const { Client } = require('pg');
const { hashPassword } = require('better-auth/crypto');

async function setupDatabase(dbUrl, dbLabel) {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log(`Connected to ${dbLabel}`);

  const hashedPassword = await hashPassword('saikat-os');
  const userId = 'user_almumeetu_saikat';
  const email = 'almumeetu@gmail.com';
  const name = 'Al Mumeetu Saikat';

  // Upsert user
  await client.query(`
    INSERT INTO "User" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, false, NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = NOW()
  `, [userId, name, email]);

  const userRes = await client.query('SELECT id FROM "User" WHERE email = $1', [email]);
  const finalUserId = userRes.rows[0].id;

  // Upsert account with password = saikat-os
  await client.query(`
    INSERT INTO "Account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, 'credential', $1, $2, NOW(), NOW())
    ON CONFLICT ("providerId", "accountId") DO UPDATE SET "password" = EXCLUDED."password", "updatedAt" = NOW()
  `, [finalUserId, hashedPassword]);

  // Insert default Cash wallet
  await client.query(`
    INSERT INTO "FinancialAccount" ("id", "userId", "name", "kind", "institution", "last4", "openingBalanceCents", "currency", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, 'Cash wallet', 'Cash', '', '', 0, 'BDT', NOW(), NOW())
    ON CONFLICT ("userId", "name") DO NOTHING
  `, [finalUserId]);

  // Insert default Categories
  const categories = ['Food', 'Transport', 'Study/Exam', 'Bills', 'Shopping', 'Health', 'Other'];
  for (const cat of categories) {
    await client.query(`
      INSERT INTO "MoneyCategory" ("id", "userId", "name", "color", "createdAt")
      VALUES (gen_random_uuid(), $1, $2, '#f08c00', NOW())
      ON CONFLICT ("userId", "name") DO NOTHING
    `, [finalUserId, cat]);
  }

  // Insert starter items
  const starter = [
    { area: 'tasks', title: 'Explore Life OS features & Dark Mode' },
    { area: 'abroad', title: 'Shortlist 8–10 universities (safe / target / dream)' },
    { area: 'abroad', title: 'Set target IELTS band score and exam date' },
    { area: 'career', title: 'Practice STAR stories in Interview Studio' },
  ];
  for (const item of starter) {
    await client.query(`
      INSERT INTO "LifeItem" ("id", "userId", "area", "title", "note", "priority", "completed", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, 'Initial workspace step', 2, false, NOW(), NOW())
    `, [finalUserId, item.area, item.title]);
  }

  console.log(`Database ${dbLabel} configured with user ${email} and password saikat-os!`);
  await client.end();
}

async function run() {
  await setupDatabase('postgresql://saikat-os:saikat-os@127.0.0.1:5432/saikat-os?schema=public', 'saikat-os');
  await setupDatabase('postgresql://lifeos:lifeos_dev_password@localhost:5432/lifeos?schema=public', 'lifeos');
}

run().catch(console.error);
