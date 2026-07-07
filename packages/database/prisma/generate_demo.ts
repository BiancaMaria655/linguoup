import * as fs from 'fs';
import * as path from 'path';

// Helper to escape single quotes in SQL strings
function escapeSqlString(val: string): string {
  return val.replace(/'/g, "''");
}

// Helper to format Date for PostgreSQL TIMESTAMP
function pgTimestamp(d: Date): string {
  return d.toISOString().replace('T', ' ').replace('Z', '+00');
}

// Standard Argon2id password hashes (same as seed.ts)
const STUDENT_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$DiX5e3E9ukMhWMvK+7gm/w$PGjA9Qt4w1Rq5bX3N0cDMlG8Vi0ZUvNz9gAMbcUOP5o'; // 'student123'
const ADMIN_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$qlrDX2JM3Sq8WHV8L4yOYw$ByUk2w+DMrrVbV1mJxAjvwzL1s8hhhkTDRMZ+j+tK14'; // 'admin123'

async function main() {
  console.log('Generating demo database SQL...');

  const sqlLines: string[] = [];
  sqlLines.push('-- LinguoUp Demo Database Seed Script');
  sqlLines.push('-- Generated programmatically to ensure 100% referential integrity and date consistency');
  sqlLines.push('');

  // 1. Achievements Definition (Pre-seeded with fixed UUIDs)
  const achievements = [
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb01', name: 'Primeira Lição', description: 'Complete sua primeira lição', iconUrl: '/icons/achievements/first-lesson.svg', xpReward: 50, criteria: { type: 'lessons_completed', threshold: 1 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb02', name: 'Sequência de 3 dias', description: 'Mantenha uma sequência de 3 dias consecutivos', iconUrl: '/icons/achievements/streak-3.svg', xpReward: 75, criteria: { type: 'streak_days', threshold: 3 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb03', name: 'Sequência de 7 dias', description: 'Mantenha uma sequência de 7 dias consecutivos', iconUrl: '/icons/achievements/streak-7.svg', xpReward: 150, criteria: { type: 'streak_days', threshold: 7 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb04', name: '100 XP', description: 'Acumule 100 XP no total', iconUrl: '/icons/achievements/xp-100.svg', xpReward: 30, criteria: { type: 'total_xp', threshold: 100 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb05', name: '500 XP', description: 'Acumule 500 XP no total', iconUrl: '/icons/achievements/xp-500.svg', xpReward: 100, criteria: { type: 'total_xp', threshold: 500 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb06', name: '10 lições', description: 'Complete 10 lições', iconUrl: '/icons/achievements/lessons-10.svg', xpReward: 100, criteria: { type: 'lessons_completed', threshold: 10 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb07', name: '25 lições', description: 'Complete 25 lições', iconUrl: '/icons/achievements/lessons-25.svg', xpReward: 200, criteria: { type: 'lessons_completed', threshold: 25 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb08', name: 'Iniciante', description: 'Complete sua primeira lição e dê o primeiro passo', iconUrl: '/icons/achievements/beginner.svg', xpReward: 50, criteria: { type: 'lessons_completed', threshold: 1 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb09', name: 'Intermediário', description: 'Acumule 100 XP e mostre sua dedicação', iconUrl: '/icons/achievements/intermediate.svg', xpReward: 50, criteria: { type: 'total_xp', threshold: 100 } },
    { id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb10', name: 'Avançado', description: 'Acumule 500 XP e demonstre maestria', iconUrl: '/icons/achievements/advanced.svg', xpReward: 100, criteria: { type: 'total_xp', threshold: 500 } },
  ];

  sqlLines.push('-- 1. INSERT Achievements');
  sqlLines.push('INSERT INTO "Achievement" ("id", "name", "description", "iconUrl", "xpReward", "criteria") VALUES');
  const achievementValues = achievements.map((a) => {
    return `  ('${a.id}', '${escapeSqlString(a.name)}', '${escapeSqlString(a.description)}', '${a.iconUrl}', ${a.xpReward}, '${JSON.stringify(a.criteria)}'::jsonb)`;
  });
  sqlLines.push(achievementValues.join(',\n') + '\nON CONFLICT ("id") DO NOTHING;\n');

  // 2. Lessons Catalog Definition (25 lessons covering CEFR levels A1-C2 across tenants)
  const tenant1 = 'tenant_default_123';
  const tenant2 = 'tenant_corporate_abc';

  // Helper to generate simple content JSON
  const makeContent = (title: string, theme: string) => ({
    slides: [
      { type: 'intro', text: `Welcome to the lesson on ${title}!` },
      { type: 'vocab', term: 'Example Word', translation: 'Palavra de Exemplo', audioUrl: 'example.mp3' },
      { type: 'quiz', question: `Which is related to ${theme}?`, options: ['Option A', 'Option B', 'Option C'], answer: 'Option A' }
    ]
  });

  const lessons = [
    // Tenant 1 Lessons
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c01', tenant_id: tenant1, title: 'Greetings & Introductions', description: 'Learn basic greetings.', level: 'A1', theme: 'Greetings', durationMinutes: 10, content: makeContent('Greetings', 'Greetings') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c02', tenant_id: tenant1, title: 'Ordering Coffee', description: 'How to order food/drinks.', level: 'A1', theme: 'Food & Drinks', durationMinutes: 12, content: makeContent('Ordering Coffee', 'Food & Drinks') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c03', tenant_id: tenant1, title: 'Airport Navigation', description: 'How to find your way around airports.', level: 'A2', theme: 'Travel', durationMinutes: 15, content: makeContent('Airport Navigation', 'Travel') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c04', tenant_id: tenant1, title: 'At the Hotel Front Desk', description: 'Learn hotel vocab.', level: 'A2', theme: 'Travel', durationMinutes: 15, content: makeContent('At the Hotel Front Desk', 'Travel') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c05', tenant_id: tenant1, title: 'Professional Introductions', description: 'Learn corporate greetings.', level: 'B1', theme: 'Career', durationMinutes: 15, content: makeContent('Professional Introductions', 'Career') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c06', tenant_id: tenant1, title: 'Describing Your Role', description: 'Talk about your career and responsibilities.', level: 'B1', theme: 'Career', durationMinutes: 20, content: makeContent('Describing Your Role', 'Career') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c07', tenant_id: tenant1, title: 'Effective Remote Meetings', description: 'Vocab for online meetings.', level: 'B2', theme: 'Career', durationMinutes: 20, content: makeContent('Effective Remote Meetings', 'Career') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c08', tenant_id: tenant1, title: 'Expressing Opinions Politer', description: 'Grammar and phrases for polite discussion.', level: 'B2', theme: 'Social', durationMinutes: 18, content: makeContent('Expressing Opinions Politer', 'Social') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c09', tenant_id: tenant1, title: 'Advanced Idioms & Metaphors', description: 'Speak like a native using idioms.', level: 'C1', theme: 'Social', durationMinutes: 22, content: makeContent('Advanced Idioms', 'Social') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c10', tenant_id: tenant1, title: 'Academic Debates', description: 'Structure complex arguments.', level: 'C2', theme: 'Social', durationMinutes: 30, content: makeContent('Academic Debates', 'Social') },
    
    // Tenant 2 Lessons
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c11', tenant_id: tenant2, title: 'Corporate Greetings', description: 'Introduce yourself in corporate settings.', level: 'A1', theme: 'Greetings', durationMinutes: 10, content: makeContent('Corporate Greetings', 'Greetings') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c12', tenant_id: tenant2, title: 'Lunch with Colleagues', description: 'Informal food/drinks vocab.', level: 'A1', theme: 'Food & Drinks', durationMinutes: 12, content: makeContent('Lunch with Colleagues', 'Food & Drinks') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c13', tenant_id: tenant2, title: 'Business Travel Essentials', description: 'Travel vocabulary for work trips.', level: 'A2', theme: 'Travel', durationMinutes: 15, content: makeContent('Business Travel Essentials', 'Travel') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c14', tenant_id: tenant2, title: 'Booking a Taxi', description: 'How to book transport.', level: 'A2', theme: 'Travel', durationMinutes: 10, content: makeContent('Booking a Taxi', 'Travel') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c15', tenant_id: tenant2, title: 'Handling Client Calls', description: 'Key dialogue strategies.', level: 'B1', theme: 'Career', durationMinutes: 18, content: makeContent('Handling Client Calls', 'Career') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c16', tenant_id: tenant2, title: 'Agile & Scrum Terms', description: 'Project management vocabulary.', level: 'B1', theme: 'Career', durationMinutes: 15, content: makeContent('Agile & Scrum Terms', 'Career') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c17', tenant_id: tenant2, title: 'Negotiating Contracts', description: 'Advanced phrases for contracts.', level: 'B2', theme: 'Career', durationMinutes: 25, content: makeContent('Negotiating Contracts', 'Career') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c18', tenant_id: tenant2, title: 'Giving Constructive Feedback', description: 'How to review colleagues politely.', level: 'B2', theme: 'Social', durationMinutes: 20, content: makeContent('Constructive Feedback', 'Social') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c19', tenant_id: tenant2, title: 'Corporate Rhetoric & Persuasion', description: 'Persuade stakeholders in presentations.', level: 'C1', theme: 'Career', durationMinutes: 25, content: makeContent('Corporate Rhetoric', 'Career') },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c20', tenant_id: tenant2, title: 'Boardroom Negotiations', description: 'High-stakes boardroom language.', level: 'C2', theme: 'Career', durationMinutes: 30, content: makeContent('Boardroom Negotiations', 'Career') },

    // Assessment Lessons (Global-like but mapped to tenants)
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c21', tenant_id: tenant1, title: 'Placement Assessment A1', description: 'Assessment Lesson A1.', level: 'A1', theme: 'assessment', durationMinutes: 2, content: { type: 'question', question: 'Translate: Hello', options: ['Olá', 'Tchau'], answer: 'Olá' } },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c22', tenant_id: tenant1, title: 'Placement Assessment A2', description: 'Assessment Lesson A2.', level: 'A2', theme: 'assessment', durationMinutes: 2, content: { type: 'question', question: 'Translate: Excuse me', options: ['Com licença', 'Obrigado'], answer: 'Com licença' } },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c23', tenant_id: tenant2, title: 'Placement Assessment B1', description: 'Assessment Lesson B1.', level: 'B1', theme: 'assessment', durationMinutes: 2, content: { type: 'question', question: 'Complete: I have been __ English.', options: ['studying', 'studied'], answer: 'studying' } },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c24', tenant_id: tenant2, title: 'Placement Assessment B2', description: 'Assessment Lesson B2.', level: 'B2', theme: 'assessment', durationMinutes: 2, content: { type: 'question', question: 'Complete: If I __ you...', options: ['were', 'am'], answer: 'were' } },
    { id: 'a1b1c1d1-e1f1-4a1b-8c1d-1e1f1a1b1c25', tenant_id: tenant1, title: 'Placement Assessment C1', description: 'Assessment Lesson C1.', level: 'C1', theme: 'assessment', durationMinutes: 2, content: { type: 'question', question: 'Define Specious.', options: ['Misleadingly attractive', 'Genuine'], answer: 'Misleadingly attractive' } },
  ];

  sqlLines.push('-- 2. INSERT Lessons');
  sqlLines.push('INSERT INTO "Lesson" ("id", "tenant_id", "title", "description", "level", "theme", "durationMinutes", "content", "isActive", "createdAt") VALUES');
  const lessonValues = lessons.map((l) => {
    return `  ('${l.id}', '${l.tenant_id}', '${escapeSqlString(l.title)}', '${escapeSqlString(l.description)}', '${l.level}', '${l.theme}', ${l.durationMinutes}, '${JSON.stringify(l.content)}'::jsonb, true, NOW())`;
  });
  sqlLines.push(lessonValues.join(',\n') + '\nON CONFLICT ("id") DO NOTHING;\n');

  // 3. Users Definition
  // 25 users in total
  const users = [
    // Tenant 1 Users (13)
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000001', tenant_id: tenant1, email: 'superadmin1@linguoup.local', name: 'Alfonso SuperAdmin', role: 'SUPER_ADMIN', isStudent: false },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000002', tenant_id: tenant1, email: 'admin1@linguoup.local', name: 'Bernardo Admin', role: 'ADMIN', isStudent: false },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000003', tenant_id: tenant1, email: 'admin2@linguoup.local', name: 'Carla Admin', role: 'ADMIN', isStudent: false },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000004', tenant_id: tenant1, email: 'student_a1_active@linguoup.local', name: 'Daniel Silva', role: 'USER', isStudent: true, level: 'A1', plan: 'travel', streak: 4, xp: 230, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000005', tenant_id: tenant1, email: 'student_a2_active@linguoup.local', name: 'Eduarda Costa', role: 'USER', isStudent: true, level: 'A2', plan: 'career', streak: 12, xp: 620, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000006', tenant_id: tenant1, email: 'student_b1_active@linguoup.local', name: 'Filipe Santos', role: 'USER', isStudent: true, level: 'B1', plan: 'culture', streak: 8, xp: 480, lastActiveDaysAgo: 1 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000007', tenant_id: tenant1, email: 'student_b2_active@linguoup.local', name: 'Gabriela Lima', role: 'USER', isStudent: true, level: 'B2', plan: 'career', streak: 21, xp: 1450, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000008', tenant_id: tenant1, email: 'student_c1_active@linguoup.local', name: 'Hugo Oliveira', role: 'USER', isStudent: true, level: 'C1', plan: 'academic', streak: 15, xp: 1100, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000009', tenant_id: tenant1, email: 'student_c2_active@linguoup.local', name: 'Isabela Rocha', role: 'USER', isStudent: true, level: 'C2', plan: 'career', streak: 25, xp: 1800, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000010', tenant_id: tenant1, email: 'student_a2_struggling@linguoup.local', name: 'Joao Melo', role: 'USER', isStudent: true, level: 'A2', plan: 'travel', streak: 0, xp: 120, lastActiveDaysAgo: 10 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000011', tenant_id: tenant1, email: 'student_b1_struggling@linguoup.local', name: 'Karina Lopes', role: 'USER', isStudent: true, level: 'B1', plan: 'career', streak: 0, xp: 220, lastActiveDaysAgo: 14 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000012', tenant_id: tenant1, email: 'student_a1_new@linguoup.local', name: 'Lucas Souza', role: 'USER', isStudent: true, level: 'A1', plan: 'general', streak: 0, xp: 0, lastActiveDaysAgo: 1 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000013', tenant_id: tenant1, email: 'student_b2_inactive@linguoup.local', name: 'Mariana Martins', role: 'USER', isStudent: true, level: 'B2', plan: 'culture', streak: 0, xp: 150, lastActiveDaysAgo: 30 },

    // Tenant 2 Users (12)
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000014', tenant_id: tenant2, email: 'superadmin2@linguoup.local', name: 'Newton Corporate Super', role: 'SUPER_ADMIN', isStudent: false },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000015', tenant_id: tenant2, email: 'admin3@linguoup.local', name: 'Olivia Corporate Admin', role: 'ADMIN', isStudent: false },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000016', tenant_id: tenant2, email: 'admin4@linguoup.local', name: 'Pedro Corporate Admin', role: 'ADMIN', isStudent: false },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000017', tenant_id: tenant2, email: 'corp_a2_active@linguoup.local', name: 'Renata Albuquerque', role: 'USER', isStudent: true, level: 'A2', plan: 'career', streak: 5, xp: 340, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000018', tenant_id: tenant2, email: 'corp_b1_active@linguoup.local', name: 'Samuel Viana', role: 'USER', isStudent: true, level: 'B1', plan: 'career', streak: 10, xp: 580, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000019', tenant_id: tenant2, email: 'corp_b2_active@linguoup.local', name: 'Teresa Xavier', role: 'USER', isStudent: true, level: 'B2', plan: 'career', streak: 14, xp: 950, lastActiveDaysAgo: 0 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000020', tenant_id: tenant2, email: 'corp_c1_active@linguoup.local', name: 'Ulisses Borges', role: 'USER', isStudent: true, level: 'C1', plan: 'career', streak: 18, xp: 1200, lastActiveDaysAgo: 1 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000021', tenant_id: tenant2, email: 'corp_b2_struggling@linguoup.local', name: 'Valeria Nunes', role: 'USER', isStudent: true, level: 'B2', plan: 'career', streak: 0, xp: 180, lastActiveDaysAgo: 8 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000022', tenant_id: tenant2, email: 'corp_c1_struggling@linguoup.local', name: 'Wagner Cardoso', role: 'USER', isStudent: true, level: 'C1', plan: 'career', streak: 0, xp: 400, lastActiveDaysAgo: 12 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000023', tenant_id: tenant2, email: 'corp_a2_new@linguoup.local', name: 'Yasmin Fernandes', role: 'USER', isStudent: true, level: 'A2', plan: 'general', streak: 0, xp: 0, lastActiveDaysAgo: 2 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000024', tenant_id: tenant2, email: 'corp_a1_inactive@linguoup.local', name: 'Zelia Ferreira', role: 'USER', isStudent: true, level: 'A1', plan: 'career', streak: 0, xp: 50, lastActiveDaysAgo: 25 },
    { id: 'f2b87a91-4567-4bcd-8ef9-000000000025', tenant_id: tenant2, email: 'corp_b1_active2@linguoup.local', name: 'Arthur Ramos', role: 'USER', isStudent: true, level: 'B1', plan: 'career', streak: 3, xp: 210, lastActiveDaysAgo: 0 }
  ];

  sqlLines.push('-- 3. INSERT Users');
  sqlLines.push('INSERT INTO "User" ("id", "tenant_id", "email", "name", "passwordHash", "role", "createdAt", "updatedAt") VALUES');
  const userValues = users.map((u) => {
    const hash = (u.role === 'USER') ? STUDENT_PASSWORD_HASH : ADMIN_PASSWORD_HASH;
    return `  ('${u.id}', '${u.tenant_id}', '${u.email}', '${escapeSqlString(u.name)}', '${hash}', '${u.role}'::"Role", NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days')`;
  });
  sqlLines.push(userValues.join(',\n') + '\nON CONFLICT ("id") DO NOTHING;\n');

  // 4. UserPreferences & UserProgress for students
  const students = users.filter((u) => u.isStudent);

  sqlLines.push('-- 4a. INSERT UserPreferences');
  sqlLines.push('INSERT INTO "UserPreferences" ("userId", "targetLanguage", "learningGoal", "dailyGoalMinutes", "dailyGoalLessons", "preferredStudyTime", "proficiencyLevel", "studyReminderTime", "studyReminderEmail", "onboardingCompleted", "createdAt", "updatedAt") VALUES');
  const prefValues = students.map((s) => {
    const isNew = s.xp === 0;
    const completed = isNew ? 'false' : 'true';
    return `  ('${s.id}', 'en', '${s.plan}', 15, 1, '08:00', '${s.level}', '08:00', true, ${completed}, NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days')`;
  });
  sqlLines.push(prefValues.join(',\n') + '\nON CONFLICT ("userId") DO NOTHING;\n');

  // Generate completions & progress mathematically to match the plan
  // We'll write loops to generate a chronological log of completed lessons
  const completions: any[] = [];
  const progressItems: any[] = [];
  const userAchievements: any[] = [];
  const reviews: any[] = [];
  const notifications: any[] = [];

  let completionIdSeq = 1;
  let reviewIdSeq = 1;
  let notificationIdSeq = 1;

  for (const s of students) {
    const lessonsForTenant = lessons.filter((l) => l.tenant_id === s.tenant_id);
    const regularLessons = lessonsForTenant.filter((l) => l.theme !== 'assessment');
    
    // We will simulate lesson completions based on the user's XP and active status
    const targetLessonsCount = Math.floor(s.xp! / 50); // roughly 50 XP per completion
    let currentXP = 0;
    let maxStreak = s.streak!;
    
    // Calculate completions distribution
    if (targetLessonsCount > 0) {
      // Generate completions distributed backwards from lastActiveDaysAgo
      for (let i = 0; i < targetLessonsCount; i++) {
        // Distribute chronologically: let's say one lesson completed per active day
        const daysAgo = s.lastActiveDaysAgo! + (targetLessonsCount - 1 - i);
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - daysAgo);
        date.setUTCHours(10 + (i % 4), 15, 0, 0);

        // Pick a lesson, cycling through regular lessons
        const lesson = regularLessons[i % regularLessons.length];

        const score = 80 + Math.floor(Math.random() * 21); // 80 - 100
        const xp = score >= 90 ? 50 : 40;
        currentXP += xp;

        completions.push({
          id: `e3d7a8b9-1234-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
          tenant_id: s.tenant_id,
          userId: s.id,
          lessonId: lesson.id,
          completedAt: date,
          score,
          xpEarned: xp
        });

        // Add Spaced Repetition reviews for vocab items from this lesson
        // Simulating the user's recall over time
        const SM2_ease = 2.5;
        const SM2_rep = i === targetLessonsCount - 1 ? 1 : 2;
        const SM2_interval = SM2_rep === 1 ? 1 : 4;
        
        // Calculate next review date using SM-2
        const nextReviewDate = new Date(date);
        nextReviewDate.setUTCDate(nextReviewDate.getUTCDate() + SM2_interval);
        nextReviewDate.setUTCHours(0, 0, 0, 0);

        // For struggling or inactive users, we push the review date back to make it due in the past
        if (s.lastActiveDaysAgo! > 2 && i === targetLessonsCount - 1) {
          nextReviewDate.setUTCDate(nextReviewDate.getUTCDate() - (s.lastActiveDaysAgo! - 1));
        }

        reviews.push({
          id: `d4e5f6a7-2345-4bcd-8ef9-${String(reviewIdSeq++).padStart(12, '0')}`,
          tenant_id: s.tenant_id,
          userId: s.id,
          lessonId: lesson.id,
          itemContent: `Vocabulary Quiz: ${lesson.title}`,
          itemType: 'vocabulary',
          nextReviewAt: nextReviewDate,
          easeFactor: SM2_ease,
          interval: SM2_interval,
          repetitions: SM2_rep,
          quality: 4,
          createdAt: date,
          updatedAt: date
        });

        reviews.push({
          id: `d4e5f6a7-2345-4bcd-8ef9-${String(reviewIdSeq++).padStart(12, '0')}`,
          tenant_id: s.tenant_id,
          userId: s.id,
          lessonId: lesson.id,
          itemContent: `Grammar Focus: ${lesson.title}`,
          itemType: 'grammar',
          nextReviewAt: nextReviewDate,
          easeFactor: SM2_ease,
          interval: SM2_interval,
          repetitions: SM2_rep,
          quality: 5,
          createdAt: date,
          updatedAt: date
        });
      }
    }

    // Adjust UserProgress current streak and total XP
    const lastActivity = completions.length > 0 
      ? completions[completions.length - 1].completedAt 
      : null;

    progressItems.push({
      id: `a3c4b5d6-3456-4bcd-8ef9-${s.id.substring(30)}`,
      userId: s.id,
      tenant_id: s.tenant_id,
      totalXP: currentXP,
      currentLevel: Math.max(1, Math.floor(currentXP / 300) + 1),
      currentStreakDays: s.streak!,
      longestStreak: Math.max(s.streak!, maxStreak, s.streak! > 0 ? s.streak! + 2 : 5),
      lastActivityDate: lastActivity
    });

    // Check achievement eligibility
    // - Primera Lição: completions >= 1
    // - Streak 3: streak >= 3
    // - Streak 7: streak >= 7
    // - 100 XP: totalXP >= 100
    // - 500 XP: totalXP >= 500
    // - 10 lições: completions >= 10
    // - 25 lições: completions >= 25
    // - Iniciante: completions >= 1
    // - Intermediário: totalXP >= 100
    // - Avançado: totalXP >= 500
    if (completions.filter(c => c.userId === s.id).length >= 1) {
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[0].id, // Primera Lição
        unlockedAt: completions.filter(c => c.userId === s.id)[0].completedAt
      });
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[7].id, // Iniciante
        unlockedAt: completions.filter(c => c.userId === s.id)[0].completedAt
      });
    }
    if (s.streak! >= 3) {
      const activeComps = completions.filter(c => c.userId === s.id);
      const unlockDate = activeComps.length >= 3 ? activeComps[2].completedAt : new Date();
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[1].id, // Streak 3
        unlockedAt: unlockDate
      });
    }
    if (s.streak! >= 7) {
      const activeComps = completions.filter(c => c.userId === s.id);
      const unlockDate = activeComps.length >= 7 ? activeComps[6].completedAt : new Date();
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[2].id, // Streak 7
        unlockedAt: unlockDate
      });
    }
    if (currentXP >= 100) {
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[3].id, // 100 XP
        unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      });
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[8].id, // Intermediário
        unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      });
    }
    if (currentXP >= 500) {
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[4].id, // 500 XP
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      });
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[9].id, // Avançado
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      });
    }
    if (completions.filter(c => c.userId === s.id).length >= 10) {
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[5].id, // 10 lições
        unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });
    }
    if (completions.filter(c => c.userId === s.id).length >= 25) {
      userAchievements.push({
        id: `c5d6e7f8-4567-4bcd-8ef9-${String(completionIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        achievementId: achievements[6].id, // 25 lições
        unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      });
    }

    // Notifications
    const createNotification = (type: 'REMINDER' | 'SYSTEM', channel: 'PUSH' | 'EMAIL', msg: string, daysAgo: number, isRead: boolean) => {
      const sent = new Date();
      sent.setUTCDate(sent.getUTCDate() - daysAgo);
      const read = isRead ? new Date(sent.getTime() + 10 * 60 * 1000) : null;
      
      notifications.push({
        id: `b4c5d6e7-5678-4bcd-8ef9-${String(notificationIdSeq++).padStart(12, '0')}`,
        tenant_id: s.tenant_id,
        userId: s.id,
        type,
        channel,
        message: msg,
        readAt: read,
        sentAt: sent,
        createdAt: sent
      });
    };

    // System Welcome
    createNotification('SYSTEM', 'EMAIL', 'Bem-vindo ao LinguoUp! Comece seu onboarding e defina suas metas diárias hoje mesmo.', 30, true);
    
    // Reminders
    if (s.lastActiveDaysAgo! > 0) {
      createNotification('REMINDER', 'PUSH', `Olá ${s.name.split(' ')[0]}, não perca a sua meta diária de hoje! Continue sua jornada.`, s.lastActiveDaysAgo!, false);
    } else {
      createNotification('REMINDER', 'PUSH', `Parabéns ${s.name.split(' ')[0]}! Você completou sua meta diária de hoje.`, 0, true);
    }

    if (currentXP >= 100) {
      createNotification('SYSTEM', 'PUSH', 'Conquista Desbloqueada: Você atingiu 100 XP!', 20, true);
    }
    if (s.streak! >= 5) {
      createNotification('SYSTEM', 'PUSH', `Incrível! Você está em uma sequência de ${s.streak} dias!`, 1, true);
    }
  }

  // 4b. INSERT UserProgress
  sqlLines.push('-- 4b. INSERT UserProgress');
  sqlLines.push('INSERT INTO "UserProgress" ("id", "userId", "tenant_id", "totalXP", "currentLevel", "currentStreakDays", "longestStreak", "lastActivityDate") VALUES');
  const progValues = progressItems.map((p) => {
    const activity = p.lastActivityDate ? `'${pgTimestamp(p.lastActivityDate)}'` : 'NULL';
    return `  ('${p.id}', '${p.userId}', '${p.tenant_id}', ${p.totalXP}, ${p.currentLevel}, ${p.currentStreakDays}, ${p.longestStreak}, ${activity})`;
  });
  sqlLines.push(progValues.join(',\n') + '\nON CONFLICT ("id") DO NOTHING;\n');

  // 5. INSERT LessonCompletions (140+ entries)
  sqlLines.push('-- 5. INSERT LessonCompletions');
  sqlLines.push('INSERT INTO "LessonCompletion" ("id", "tenant_id", "userId", "lessonId", "completedAt", "score", "xpEarned") VALUES');
  const compChunks: string[] = [];
  completions.forEach((c) => {
    compChunks.push(`  ('${c.id}', '${c.tenant_id}', '${c.userId}', '${c.lessonId}', '${pgTimestamp(c.completedAt)}', ${c.score}, ${c.xpEarned})`);
  });
  sqlLines.push(compChunks.join(',\n') + '\nON CONFLICT ("id") DO NOTHING;\n');

  // 6. INSERT UserAchievements
  sqlLines.push('-- 6. INSERT UserAchievements');
  sqlLines.push('INSERT INTO "UserAchievement" ("id", "tenant_id", "userId", "achievementId", "unlockedAt") VALUES');
  const achValues = userAchievements.map((ua) => {
    return `  ('${ua.id}', '${ua.tenant_id}', '${ua.userId}', '${ua.achievementId}', '${pgTimestamp(ua.unlockedAt)}')`;
  });
  sqlLines.push(achValues.join(',\n') + '\nON CONFLICT ("userId", "achievementId") DO NOTHING;\n');

  // 7. INSERT SpacedReviewItems
  sqlLines.push('-- 7. INSERT SpacedReviewItems');
  sqlLines.push('INSERT INTO "SpacedReviewItem" ("id", "tenant_id", "userId", "lessonId", "itemContent", "itemType", "nextReviewAt", "easeFactor", "interval", "repetitions", "quality", "createdAt", "updatedAt") VALUES');
  const revChunks: string[] = [];
  reviews.forEach((r) => {
    const qual = r.quality ? r.quality : 'NULL';
    revChunks.push(`  ('${r.id}', '${r.tenant_id}', '${r.userId}', '${r.lessonId}', '${escapeSqlString(r.itemContent)}', '${r.itemType}', '${pgTimestamp(r.nextReviewAt)}', ${r.easeFactor}, ${r.interval}, ${r.repetitions}, ${qual}, '${pgTimestamp(r.createdAt)}', '${pgTimestamp(r.updatedAt)}')`);
  });
  sqlLines.push(revChunks.join(',\n') + '\nON CONFLICT ("userId", "lessonId", "itemContent") DO NOTHING;\n');

  // 8. INSERT Notifications
  sqlLines.push('-- 8. INSERT Notifications');
  sqlLines.push('INSERT INTO "Notification" ("id", "tenant_id", "userId", "type", "channel", "message", "readAt", "sentAt", "createdAt") VALUES');
  const notValues = notifications.map((n) => {
    const read = n.readAt ? `'${pgTimestamp(n.readAt)}'` : 'NULL';
    return `  ('${n.id}', '${n.tenant_id}', '${n.userId}', '${n.type}'::"NotificationType", '${n.channel}'::"NotificationChannel", '${escapeSqlString(n.message)}', ${read}, '${pgTimestamp(n.sentAt)}', '${pgTimestamp(n.createdAt)}')`;
  });
  sqlLines.push(notValues.join(',\n') + '\nON CONFLICT ("id") DO NOTHING;\n');

  const destPath = path.join(__dirname, 'demo_data.sql');
  fs.writeFileSync(destPath, sqlLines.join('\n'));
  console.log(`Successfully generated demo data SQL at ${destPath}`);
}

main().catch((err) => {
  console.error('Error generating demo data:', err);
  process.exit(1);
});
