const { Client } = require('pg');
require('dotenv').config();

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function seedDatabase(connectionString, label) {
  const client = new Client({ connectionString });
  await client.connect();
  console.log(`Connected to ${label} database`);

  const userRes = await client.query('SELECT id FROM "User" WHERE email = $1', ['almumeetu@gmail.com']);
  if (!userRes.rows.length) {
    console.log(`User almumeetu@gmail.com not found in ${label}. Skipping.`);
    await client.end();
    return;
  }
  const userId = userRes.rows[0].id;
  const now = new Date();

  // 1. FINANCIAL ACCOUNTS
  const accountsData = [
    { name: 'Cash wallet', kind: 'Cash', institution: 'Cash on Hand', last4: '', opening: 1500000, cur: 'BDT' },
    { name: 'BRAC Bank Savings', kind: 'Bank', institution: 'BRAC Bank PLC', last4: '4210', opening: 35000000, cur: 'BDT' },
    { name: 'bKash Personal', kind: 'Mobile wallet', institution: 'bKash Limited', last4: '9821', opening: 2500000, cur: 'BDT' },
    { name: 'Study Abroad & IELTS Fund', kind: 'Savings', institution: 'Mutual Trust Bank', last4: '7734', opening: 40000000, cur: 'BDT' },
  ];

  const accountIds = {};
  for (const acc of accountsData) {
    const res = await client.query(`
      INSERT INTO "FinancialAccount" ("id", "userId", "name", "kind", "institution", "last4", "openingBalanceCents", "currency", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT ("userId", "name") DO UPDATE SET "openingBalanceCents" = EXCLUDED."openingBalanceCents", "institution" = EXCLUDED."institution"
      RETURNING id, name
    `, [userId, acc.name, acc.kind, acc.institution, acc.last4, acc.opening, acc.cur]);
    accountIds[res.rows[0].name] = res.rows[0].id;
  }

  // 2. PAYMENT CARDS
  const cardsData = [
    { name: 'BRAC Visa Platinum Debit', kind: 'Debit', network: 'Visa', last4: '4210', accName: 'BRAC Bank Savings' },
    { name: 'MTB Dual Currency Mastercard', kind: 'Credit', network: 'Mastercard', last4: '8821', accName: 'Study Abroad & IELTS Fund' },
  ];
  const cardIds = {};
  for (const c of cardsData) {
    const accId = accountIds[c.accName] || null;
    const res = await client.query(`
      INSERT INTO "PaymentCard" ("id", "userId", "accountId", "name", "kind", "network", "last4", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name
    `, [userId, accId, c.name, c.kind, c.network, c.last4]);
    cardIds[res.rows[0].name] = res.rows[0].id;
  }

  // 3. MONEY CATEGORIES
  const categories = [
    { name: 'Study/Exam', color: '#1c7ed6' },
    { name: 'University Apps', color: '#7048e8' },
    { name: 'Books & Resources', color: '#0ca678' },
    { name: 'Food', color: '#f08c00' },
    { name: 'Transport', color: '#2f9e44' },
    { name: 'Bills', color: '#e8590c' },
    { name: 'Shopping', color: '#d6336c' },
    { name: 'Health', color: '#20c997' },
    { name: 'Other', color: '#868e96' },
  ];
  const categoryIds = {};
  for (const cat of categories) {
    const res = await client.query(`
      INSERT INTO "MoneyCategory" ("id", "userId", "name", "color", "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      ON CONFLICT ("userId", "name") DO UPDATE SET "color" = EXCLUDED."color"
      RETURNING id, name
    `, [userId, cat.name, cat.color]);
    categoryIds[res.rows[0].name] = res.rows[0].id;
  }

  // 4. TRANSACTIONS (Realistic study, exam, and tech income)
  const transactionsData = [
    { desc: 'IELTS Official Exam Fee (British Council)', kind: 'Expense', amount: 2350000, cat: 'Study/Exam', acc: 'BRAC Bank Savings', daysAgo: 5, note: 'Registered for Academic IELTS computer-delivered exam.' },
    { desc: 'Cambridge IELTS 18 & 19 Practice Books', kind: 'Expense', amount: 320000, cat: 'Books & Resources', acc: 'bKash Personal', daysAgo: 8, note: 'Original test papers with listening audio CDs.' },
    { desc: 'University Transcript & Degree Attestation', kind: 'Expense', amount: 750000, cat: 'University Apps', acc: 'Cash wallet', daysAgo: 12, note: 'Board & Ministry attestation for German university applications.' },
    { desc: 'German Language A1 Course & Materials', kind: 'Expense', amount: 850000, cat: 'Study/Exam', acc: 'bKash Personal', daysAgo: 18, note: 'Goethe-Institut beginner course enrollment.' },
    { desc: 'Full Stack Engineering Consulting / Client Project', kind: 'Income', amount: 12500000, cat: 'Other', acc: 'BRAC Bank Savings', daysAgo: 15, note: 'Full-stack Next.js commerce platform milestone payment.' },
    { desc: 'Technical Certification / Exam Voucher', kind: 'Expense', amount: 1500000, cat: 'Study/Exam', acc: 'Study Abroad & IELTS Fund', daysAgo: 22, note: 'AWS Certified Cloud Practitioner voucher.' },
    { desc: 'Passport Renewal (10 Years / 48 Pages)', kind: 'Expense', amount: 575000, cat: 'University Apps', acc: 'bKash Personal', daysAgo: 25, note: 'Urgent delivery fee for e-Passport.' },
  ];

  for (const t of transactionsData) {
    const cId = categoryIds[t.cat] || categoryIds['Other'];
    const aId = accountIds[t.acc] || accountIds['Cash wallet'];
    const occurredAt = daysAgo(t.daysAgo);
    await client.query(`
      INSERT INTO "MoneyTransaction" ("id", "userId", "categoryId", "accountId", "kind", "amountCents", "description", "note", "occurredAt", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [userId, cId, aId, t.kind, t.amount, t.desc, t.note, occurredAt]);
  }

  // 5. APPLICATIONS (Study Abroad Universities & Tech Roles)
  const applicationsData = [
    {
      title: 'MSc Informatics (Computer Science)',
      organization: 'Technical University of Munich (TUM), Germany',
      kind: 'University',
      status: 'Preparing',
      deadline: daysFromNow(45),
      url: 'https://www.tum.de/en/studies/degree-programs/detail/informatics-master-of-science-msc',
      note: 'Requirements: Curricular analysis, English C1 (IELTS 7.0+), Essay on distributed systems. No tuition fees.',
    },
    {
      title: 'MSc Computer Science - Intelligent Systems',
      organization: 'University of Stuttgart, Germany',
      kind: 'University',
      status: 'Preparing',
      deadline: daysFromNow(60),
      url: 'https://www.uni-stuttgart.de/en/study/study-programs/Computer-Science-M.Sc/',
      note: 'English taught. Focus on algorithms, distributed databases, machine learning. Check DAAD Helmut-Schmidt funding.',
    },
    {
      title: 'Master’s in Computer Science & Engineering',
      organization: 'Aalto University, Finland',
      kind: 'University',
      status: 'Wishlist',
      deadline: daysFromNow(75),
      url: 'https://www.aalto.fi/en/study-options/masters-programme-in-computer-science',
      note: 'Full tuition waiver 100% scholarship available for top international applicants. IELTS minimum 6.5 (target 7.5).',
    },
    {
      title: 'MSc Software Engineering of Distributed Systems',
      organization: 'KTH Royal Institute of Technology, Sweden',
      kind: 'University',
      status: 'Wishlist',
      deadline: daysFromNow(85),
      url: 'https://www.kth.se/en/studies/master/software-engineering-of-distributed-systems',
      note: 'Swedish Institute (SI) Global Professionals Scholarship covers full tuition + SEK 12,000/month stipend.',
    },
    {
      title: 'DAAD EPOS / Development-Related Postgraduate Scholarship',
      organization: 'DAAD (German Academic Exchange Service)',
      kind: 'Scholarship',
      status: 'Preparing',
      deadline: daysFromNow(40),
      url: 'https://www.daad.de/en/',
      note: 'Full scholarship covering €934/month living stipend, health insurance, travel grant. Requires 2+ years experience.',
    },
    {
      title: 'Senior / Lead Full Stack Engineer (Next.js & Node)',
      organization: 'Global Remote SaaS Team',
      kind: 'Job',
      status: 'Applied',
      deadline: daysFromNow(14),
      url: 'https://linkedin.com',
      note: 'First technical interview scheduled. Prepared architecture walkthrough of multi-tenant PostgreSQL POS system.',
    },
  ];

  for (const app of applicationsData) {
    await client.query(`
      INSERT INTO "Application" ("id", "userId", "title", "organization", "kind", "status", "deadline", "url", "note", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [userId, app.title, app.organization, app.kind, app.status, app.deadline, app.url, app.note]);
  }

  // 6. LIFE ITEMS (STUDY ABROAD, IELTS, CAREER, TASKS, SPEAKING)
  const lifeItems = [
    // Abroad & Universities
    { area: 'abroad', title: 'Finalize Statement of Purpose (SOP) draft for German universities', note: 'Structure: Academic motivation → Software engineering background → Research alignment with TUM & Stuttgart.', priority: 1, dueAt: daysFromNow(7), completed: false },
    { area: 'abroad', title: 'Request 2 Academic Recommendation Letters (LOR) from professors', note: 'Email Head of CSE Department and thesis advisor with attached CV and transcript.', priority: 1, dueAt: daysFromNow(10), completed: false },
    { area: 'abroad', title: 'Verify uni-assist documentation requirements for Germany (VPD process)', note: 'Check certified copies, translation stamps, and VPD processing timeline (approx. 4–6 weeks).', priority: 2, dueAt: daysFromNow(14), completed: false },
    { area: 'abroad', title: 'Prepare blocked account (Sperrkonto) budget calculation (€11,904/year)', note: 'Verify Coracle / Expatrio blocked account options and health insurance packages.', priority: 2, dueAt: daysFromNow(30), completed: false },
    { area: 'abroad', title: 'Collect all official semester transcripts and provisional degree certificates', note: 'Completed and attested from Education Ministry.', priority: 2, dueAt: daysAgo(3), completed: true, completedAt: daysAgo(3) },
    { area: 'abroad', title: 'Confirm passport validity has at least 2 full years remaining', note: 'Renewed e-Passport with 10 years validity.', priority: 3, dueAt: daysAgo(10), completed: true, completedAt: daysAgo(10) },

    // IELTS & English Speaking
    { area: 'goals', title: 'Target IELTS Academic Band 7.5+ (L: 8.5, R: 8.0, W: 7.0, S: 7.5)', note: 'Master university requirement threshold and qualify for teaching/research assistantships.', priority: 1, dueAt: daysFromNow(45), completed: false },
    { area: 'tasks', title: 'Daily English speaking: 20-minute uninterrupted speech record & review', note: 'Speak on abstract topics using Part 2 cue cards. Listen back for fluency and filler words.', priority: 1, dueAt: daysFromNow(1), completed: false },
    { area: 'tasks', title: 'IELTS Writing Task 2: Practice 3 Opinion & Discussion essays with timing', note: 'Focus on 4-paragraph structure: Introduction (paraphrase + thesis) → Body 1 → Body 2 → Clear conclusion.', priority: 1, dueAt: daysFromNow(3), completed: false },
    { area: 'tasks', title: 'IELTS Reading: Complete 1 Cambridge 19 full academic test (60 min)', note: 'Pay special attention to True/False/Not Given and Heading Matching strategies.', priority: 2, dueAt: daysFromNow(2), completed: false },
    { area: 'tasks', title: 'IELTS Listening: Practice Section 3 (academic discussion) & Section 4 (lecture)', note: 'Practice predictive spelling and identifying distractor words in audio dialogues.', priority: 2, dueAt: daysFromNow(4), completed: false },
    { area: 'tasks', title: 'Read 2 articles from The Economist or MIT Technology Review for vocabulary', note: 'Maintain a dedicated academic collocations and synonyms notebook.', priority: 3, dueAt: daysFromNow(5), completed: false },

    // Career & Tech Interview
    { area: 'career', title: 'Rehearse 5 STAR stories in Interview Studio for behavioural rounds', note: 'Stories: 1) High concurrency POS oversell fix 2) Handling changing client specs 3) Mentoring juniors 4) Performance tuning 5) Resolving critical production downtime.', priority: 1, dueAt: daysFromNow(5), completed: false },
    { area: 'career', title: 'Prepare System Design notes: PostgreSQL vs MongoDB, Indexing & Caching', note: 'Review B-tree indexes, composite indexes, Redis caching layer, and ACID vs BASE properties.', priority: 2, dueAt: daysFromNow(8), completed: false },
    { area: 'career', title: 'Polish GitHub profile, READMEs, and production project demos', note: 'Ensure live demo links and architectural flowcharts are embedded in repository READMEs.', priority: 2, dueAt: daysFromNow(12), completed: false },

    // Research & Plans
    { area: 'research', title: 'Compare German post-study work visa (18-month Jobseeker) vs Finland (2-year)', note: 'Analyze tech industry salaries, English-speaking job markets, and permanent residency (PR) routes.', priority: 2, dueAt: daysFromNow(20), completed: false },
    { area: 'research', title: 'Identify 5 professors in Distributed Systems & Cloud at TUM & Stuttgart', note: 'Read their latest publications to reference meaningfully in Statement of Purpose (SOP).', priority: 2, dueAt: daysFromNow(25), completed: false },
  ];

  for (const item of lifeItems) {
    await client.query(`
      INSERT INTO "LifeItem" ("id", "userId", "area", "title", "note", "priority", "dueAt", "completed", "completedAt", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [userId, item.area, item.title, item.note, item.priority, item.dueAt, item.completed, item.completedAt || null]);
  }

  // 7. HABITS & CHECK-INS (English speaking, IELTS, Code, Workout)
  const habitsData = [
    { title: 'Speak English 20 min', color: '#1c7ed6', checkDaysAgo: [0, 1, 2, 3, 4] },
    { title: 'IELTS Practice 30 min', color: '#f08c00', checkDaysAgo: [0, 1, 2, 4] },
    { title: 'Full-Stack Code / Build 1 hr', color: '#2f9e44', checkDaysAgo: [0, 1, 3, 4, 5] },
    { title: 'Academic Vocabulary / Reading 15 min', color: '#7048e8', checkDaysAgo: [0, 2, 3] },
    { title: 'Physical Walk & Health 30 min', color: '#0ca678', checkDaysAgo: [0, 1, 2, 3, 5] },
  ];

  for (const h of habitsData) {
    const res = await client.query(`
      INSERT INTO "Habit" ("id", "userId", "title", "color", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      ON CONFLICT ("userId", "title") DO UPDATE SET "color" = EXCLUDED."color"
      RETURNING id
    `, [userId, h.title, h.color]);
    const habitId = res.rows[0].id;

    for (const dAgo of h.checkDaysAgo) {
      const dKey = dayKey(daysAgo(dAgo));
      await client.query(`
        INSERT INTO "HabitCheckIn" ("id", "habitId", "dayKey", "createdAt")
        VALUES (gen_random_uuid(), $1, $2, NOW())
        ON CONFLICT ("habitId", "dayKey") DO NOTHING
      `, [habitId, dKey]);
    }
  }

  // 8. INTERVIEW ATTEMPTS (Voice transcripts & rehearsals)
  const interviewAttempts = [
    {
      category: 'job',
      question: 'Tell me about yourself.',
      transcript: 'I am Al Mumeetu Saikat, a full stack software engineer with over 4 years of production experience. My primary stack includes React, Next.js, and TypeScript on the frontend, and Node.js, Express, and PostgreSQL with Prisma on the backend. At Softzino Technologies, I spearheaded the architecture of multi-tenant point-of-sale and commerce software that handled high concurrent checkout transactions. I focus heavily on writing clean, maintainable code, testable APIs, and relational schema integrity.',
      duration: 65,
    },
    {
      category: 'admission',
      question: 'Why do you want to study abroad and choose this particular course?',
      transcript: 'I chose this Master of Science program because of its rigorous focus on Advanced Distributed Systems and Cloud Computing architecture. Throughout my four years building real-world software, I observed that as data scale grows, concurrency and fault tolerance become paramount. Studying under world-renowned faculty in Germany will give me theoretical depth and practical lab research that I can apply directly toward architecting resilient global software platforms.',
      duration: 72,
    },
    {
      category: 'job',
      question: 'Describe a difficult technical problem you solved using the STAR method.',
      transcript: 'Situation: In our retail point-of-sale system, multiple cashiers could simultaneously checkout the last remaining item in stock, causing critical inventory overselling. Task: I was tasked with engineering a zero-oversell guarantee without crippling checkout responsiveness. Action: I implemented strict PostgreSQL row-level locking using Prisma interactive transactions, verifying inventory availability within the atomic boundary and utilizing composite indexing on SKU. Result: We eliminated overselling entirely across all retail stores and maintained sub-100 millisecond checkout latency.',
      duration: 88,
    },
    {
      category: 'admission',
      question: 'How do you plan to fund your tuition and living expenses during your studies?',
      transcript: 'My higher education expenses will be fully self-funded through dedicated personal savings accumulated from my four years as a full stack software engineer, supplemented by committed family sponsorship. In addition, I have already prepared the official blocked account funds required by the German embassy, totaling over twelve thousand euros to guarantee living expenses throughout my academic degree.',
      duration: 52,
    },
  ];

  for (const att of interviewAttempts) {
    const words = att.transcript.trim().split(/\s+/).length;
    const fillers = (att.transcript.match(/\b(um+|uh+|like|you know|actually|basically)\b/gi) || []).length;
    const wpm = Math.round(words / (att.duration / 60));
    await client.query(`
      INSERT INTO "InterviewAttempt" ("id", "userId", "category", "question", "transcript", "wordCount", "wordsPerMinute", "fillerCount", "durationSeconds", "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [userId, att.category, att.question, att.transcript, words, wpm, fillers, att.duration]);
  }

  // 9. FOCUS SESSIONS
  const focusSessions = [
    { title: 'IELTS Academic Reading Passage 1 & 2', duration: 1500, daysAgo: 0 },
    { title: 'Statement of Purpose (SOP) Outline & Faculty Review', duration: 1500, daysAgo: 1 },
    { title: 'English Speaking Practice & Cue Card Recordings', duration: 1500, daysAgo: 2 },
    { title: 'PostgreSQL Interactive Transactions & Indexing Rehearsal', duration: 3000, daysAgo: 3 },
  ];
  for (const s of focusSessions) {
    await client.query(`
      INSERT INTO "FocusSession" ("id", "userId", "durationSeconds", "taskTitle", "completedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4)
    `, [userId, s.duration, s.title, daysAgo(s.daysAgo)]);
  }

  // 10. WEEKLY REVIEW
  const currentMonday = new Date();
  currentMonday.setDate(currentMonday.getDate() - ((currentMonday.getDay() + 6) % 7));
  const weekStartStr = dayKey(currentMonday);

  await client.query(`
    INSERT INTO "WeeklyReview" ("id", "userId", "weekStart", "wins", "lessons", "nextFocus", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
    ON CONFLICT ("userId", "weekStart") DO UPDATE SET
      "wins" = EXCLUDED."wins",
      "lessons" = EXCLUDED."lessons",
      "nextFocus" = EXCLUDED."nextFocus",
      "updatedAt" = NOW()
  `, [
    userId,
    weekStartStr,
    '• Shortlisted top German universities (TUM, Stuttgart) and verified IELTS 7.0 criteria.\n• Maintained 5-day active streak in daily 20-minute English speaking.\n• Completed 3 mock interview recordings in Interview Studio with average 120 WPM.\n• Streamlined proof of funds and attested university transcripts.',
    '• Task 2 writing essays require strict 40-minute time discipline; avoid over-drafting the introduction.\n• Consistent 20-minute daily speaking builds vastly more fluency than occasional long sessions.',
    '1. Complete Cambridge 19 full listening and reading timed practice test.\n2. Finalize first draft of Statement of Purpose (SOP) for TUM & Stuttgart.\n3. Send recommendation letter requests to university faculty.',
  ]);

  console.log(`Successfully pushed complete Study, IELTS, Interview, and Speaking data to ${label}!`);
  await client.end();
}

async function run() {
  await seedDatabase('postgresql://saikat-os:saikat-os@127.0.0.1:5432/saikat-os?schema=public', 'saikat-os');
  await seedDatabase('postgresql://lifeos:lifeos_dev_password@localhost:5432/lifeos?schema=public', 'lifeos');
}

run().catch(console.error);
