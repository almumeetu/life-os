const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const users = await client.query('SELECT id FROM "User" WHERE email = $1', ['almumeetu@gmail.com']);
  if (!users.rows.length) {
    console.log('User not found');
    await client.end();
    return;
  }
  const userId = users.rows[0].id;

  // Insert default Cash wallet
  await client.query(`
    INSERT INTO "FinancialAccount" ("id", "userId", "name", "kind", "institution", "last4", "openingBalanceCents", "currency", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, 'Cash wallet', 'Cash', '', '', 0, 'BDT', NOW(), NOW())
    ON CONFLICT ("userId", "name") DO NOTHING
  `, [userId]);

  // Insert default Categories
  const categories = ['Food', 'Transport', 'Study/Exam', 'Bills', 'Shopping', 'Health', 'Other'];
  for (const cat of categories) {
    await client.query(`
      INSERT INTO "MoneyCategory" ("id", "userId", "name", "color", "createdAt")
      VALUES (gen_random_uuid(), $1, $2, '#f08c00', NOW())
      ON CONFLICT ("userId", "name") DO NOTHING
    `, [userId, cat]);
  }

  // Insert starter Life Items
  const starter = [
    { area: 'tasks', title: 'Explore Life OS features & new Dark Mode' },
    { area: 'abroad', title: 'Shortlist 8–10 universities (safe / target / dream)' },
    { area: 'abroad', title: 'Set IELTS target band score and exam date' },
    { area: 'career', title: 'Practice 3 STAR stories in Interview Studio' },
  ];
  for (const item of starter) {
    await client.query(`
      INSERT INTO "LifeItem" ("id", "userId", "area", "title", "note", "priority", "completed", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, 'Initial workspace step', 2, false, NOW(), NOW())
    `, [userId, item.area, item.title]);
  }

  console.log('Seeded successfully!');
  await client.end();
}

main().catch(console.error);
