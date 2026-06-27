import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Clean Database
  console.log('Cleaning database...');
  await prisma.userPreferences.deleteMany({});
  await prisma.lessonCompletion.deleteMany({});
  await prisma.spacedReviewItem.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.userProgress.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.achievement.deleteMany({});

  const tenantId = 'tenant_default_123';

  // 2. Create Achievements (10 MVP achievements)
  console.log('Seeding achievements...');
  await prisma.achievement.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Primeira Lição',
        description: 'Complete sua primeira lição',
        iconUrl: '/icons/achievements/first-lesson.svg',
        xpReward: 50,
        criteria: { type: 'lessons_completed', threshold: 1 },
      },
      {
        name: 'Sequência de 3 dias',
        description: 'Mantenha uma sequência de 3 dias consecutivos',
        iconUrl: '/icons/achievements/streak-3.svg',
        xpReward: 75,
        criteria: { type: 'streak_days', threshold: 3 },
      },
      {
        name: 'Sequência de 7 dias',
        description: 'Mantenha uma sequência de 7 dias consecutivos',
        iconUrl: '/icons/achievements/streak-7.svg',
        xpReward: 150,
        criteria: { type: 'streak_days', threshold: 7 },
      },
      {
        name: '100 XP',
        description: 'Acumule 100 XP no total',
        iconUrl: '/icons/achievements/xp-100.svg',
        xpReward: 30,
        criteria: { type: 'total_xp', threshold: 100 },
      },
      {
        name: '500 XP',
        description: 'Acumule 500 XP no total',
        iconUrl: '/icons/achievements/xp-500.svg',
        xpReward: 100,
        criteria: { type: 'total_xp', threshold: 500 },
      },
      {
        name: '10 lições',
        description: 'Complete 10 lições',
        iconUrl: '/icons/achievements/lessons-10.svg',
        xpReward: 100,
        criteria: { type: 'lessons_completed', threshold: 10 },
      },
      {
        name: '25 lições',
        description: 'Complete 25 lições',
        iconUrl: '/icons/achievements/lessons-25.svg',
        xpReward: 200,
        criteria: { type: 'lessons_completed', threshold: 25 },
      },
      {
        name: 'Iniciante',
        description: 'Complete sua primeira lição e dê o primeiro passo',
        iconUrl: '/icons/achievements/beginner.svg',
        xpReward: 50,
        criteria: { type: 'lessons_completed', threshold: 1 },
      },
      {
        name: 'Intermediário',
        description: 'Acumule 100 XP e mostre sua dedicação',
        iconUrl: '/icons/achievements/intermediate.svg',
        xpReward: 50,
        criteria: { type: 'total_xp', threshold: 100 },
      },
      {
        name: 'Avançado',
        description: 'Acumule 500 XP e demonstre maestria',
        iconUrl: '/icons/achievements/advanced.svg',
        xpReward: 100,
        criteria: { type: 'total_xp', threshold: 500 },
      },
    ],
  });

  // Load first achievement for user seed reference
  const firstStepAchievement = await prisma.achievement.findFirst({
    where: { name: 'Primeira Lição' },
  });

  // 3. Create User with preferences and progress
  console.log('Seeding test user...');
  const testUser = await prisma.user.create({
    data: {
      tenant_id: tenantId,
      email: 'student@linguoup.local',
      name: 'John Doe',
      passwordHash: '$2b$10$EpYkE.UvWcQfE5Yp4r9s.OuKq/qYJgZ7yZ2P3D2R9kO9b8vTaPnvB', // placeholder
      role: Role.USER,
      preferences: {
        create: {
          targetLanguage: 'en',
          learningGoal: 'career',
          dailyGoalMinutes: 15,
          preferredStudyTime: '08:00',
        },
      },
      progress: {
        create: {
          tenant_id: tenantId,
          totalXP: 150,
          currentLevel: 2,
          currentStreakDays: 3,
          longestStreak: 5,
          lastActivityDate: new Date(),
        },
      },
    },
  });

  // 4. Create 5 Lessons
  console.log('Seeding lessons...');
  const lesson1 = await prisma.lesson.create({
    data: {
      tenant_id: tenantId,
      title: 'Greetings & Introductions',
      description: 'Learn how to introduce yourself and say basic greetings.',
      level: 'A1',
      theme: 'Greetings',
      durationMinutes: 10,
      content: {
        slides: [
          { type: 'intro', text: 'Welcome! Let us learn basic greetings.' },
          { type: 'vocab', term: 'Hello', translation: 'Olá', audioUrl: 'hello.mp3' },
          { type: 'vocab', term: 'How are you?', translation: 'Como vai você?', audioUrl: 'how_are_you.mp3' },
          {
            type: 'quiz',
            question: 'What does "Hello" mean in Portuguese?',
            options: ['Olá', 'Tchau', 'Por favor'],
            answer: 'Olá',
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      tenant_id: tenantId,
      title: 'At the Cafe',
      description: 'Learn vocabulary related to ordering food and drinks.',
      level: 'A1',
      theme: 'Food & Drinks',
      durationMinutes: 12,
      content: {
        slides: [
          { type: 'intro', text: 'Let us learn to order a coffee.' },
          { type: 'vocab', term: 'Coffee', translation: 'Café', audioUrl: 'coffee.mp3' },
          { type: 'vocab', term: 'Water', translation: 'Água', audioUrl: 'water.mp3' },
          {
            type: 'quiz',
            question: 'How do you say "Café" in English?',
            options: ['Tea', 'Coffee', 'Juice'],
            answer: 'Coffee',
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      tenant_id: tenantId,
      title: 'Airport Navigation',
      description: 'Key vocabulary to find your gate and check in.',
      level: 'A2',
      theme: 'Travel',
      durationMinutes: 15,
      content: {
        slides: [
          { type: 'intro', text: 'Learn to find your way around an airport.' },
          { type: 'vocab', term: 'Boarding Pass', translation: 'Cartão de Embarque', audioUrl: 'boarding_pass.mp3' },
          { type: 'vocab', term: 'Gate', translation: 'Portão', audioUrl: 'gate.mp3' },
          {
            type: 'quiz',
            question: 'What is a "Boarding Pass"?',
            options: ['Passaporte', 'Cartão de Embarque', 'Passagem de Ônibus'],
            answer: 'Cartão de Embarque',
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      tenant_id: tenantId,
      title: 'Checking into a Hotel',
      description: 'Understand dialogues and vocabulary for booking or checking in.',
      level: 'A2',
      theme: 'Travel',
      durationMinutes: 15,
      content: {
        slides: [
          { type: 'intro', text: 'Time to check into your room!' },
          { type: 'vocab', term: 'Key Card', translation: 'Cartão Chave', audioUrl: 'key_card.mp3' },
          { type: 'vocab', term: 'Reservation', translation: 'Reserva', audioUrl: 'reservation.mp3' },
          {
            type: 'quiz',
            question: 'What is a "Reservation"?',
            options: ['Reserva', 'Quarto', 'Recepção'],
            answer: 'Reserva',
          },
        ],
      },
    },
  });

  await prisma.lesson.create({
    data: {
      tenant_id: tenantId,
      title: 'Professional Introductions',
      description: 'Introduce yourself in a business meeting and talk about your role.',
      level: 'B1',
      theme: 'Career',
      durationMinutes: 20,
      content: {
        slides: [
          { type: 'intro', text: 'Welcome to the corporate introductions lesson.' },
          { type: 'vocab', term: 'Software Engineer', translation: 'Engenheiro de Software', audioUrl: 'software_engineer.mp3' },
          { type: 'vocab', term: 'Meeting', translation: 'Reunião', audioUrl: 'meeting.mp3' },
          {
            type: 'quiz',
            question: 'How do you translate "Reunião"?',
            options: ['Meeting', 'Office', 'Project'],
            answer: 'Meeting',
          },
        ],
      },
    },
  });

  // 4b. Seed Assessment Lessons (theme: 'assessment')
  console.log('Seeding assessment lessons...');
  const assessmentLessons = [
    {
      question: "What is the correct translation of 'Hello'?",
      options: ['Olá', 'Tchau', 'Obrigado', 'Por favor'],
      answer: 'Olá',
      level: 'A1',
    },
    {
      question: "Which sentence is grammatically correct?",
      options: ['I am go to school', 'I goes to school', 'I go to school', 'I going to school'],
      answer: 'I go to school',
      level: 'A1',
    },
    {
      question: "What does 'excuse me' mean in Portuguese?",
      options: ['Com licença', 'Desculpe', 'Por favor', 'Obrigado'],
      answer: 'Com licença',
      level: 'A2',
    },
    {
      question: "How do you say 'I have been studying English for 3 years'?",
      options: [
        'Eu estudo inglês por 3 anos',
        'Eu tenho estudado inglês por 3 anos',
        'Eu estudei inglês para 3 anos',
        'Eu estava estudando inglês por 3 anos',
      ],
      answer: 'Eu tenho estudado inglês por 3 anos',
      level: 'B1',
    },
    {
      question: "Choose the correct form: 'If I __ rich, I would travel the world.'",
      options: ['am', 'was', 'were', 'be'],
      answer: 'were',
      level: 'B1',
    },
    {
      question: "What is a synonym for 'ubiquitous'?",
      options: ['Rare', 'Omnipresent', 'Ancient', 'Modest'],
      answer: 'Omnipresent',
      level: 'B2',
    },
    {
      question: "Which word correctly completes: 'The report was __ by the manager'?",
      options: ['write', 'written', 'wrote', 'writing'],
      answer: 'written',
      level: 'B2',
    },
    {
      question: "Identify the correct use of the subjunctive mood:",
      options: [
        'I suggest that he goes home early',
        'I suggest that he go home early',
        'I suggest that he went home early',
        'I suggest that he will go home early',
      ],
      answer: 'I suggest that he go home early',
      level: 'C1',
    },
    {
      question: "What does 'pejorative' mean?",
      options: ['Positive', 'Expressing contempt', 'Neutral', 'Descriptive'],
      answer: 'Expressing contempt',
      level: 'C1',
    },
    {
      question: "Choose the most accurate paraphrase of 'Her argument was specious':",
      options: [
        'Her argument was convincing and detailed',
        'Her argument seemed valid but was actually misleading',
        'Her argument was too simple',
        'Her argument lacked evidence',
      ],
      answer: 'Her argument seemed valid but was actually misleading',
      level: 'C2',
    },
  ];

  for (const q of assessmentLessons) {
    await prisma.lesson.create({
      data: {
        tenant_id: tenantId,
        title: `Assessment: ${q.level}`,
        description: 'Level assessment question',
        level: q.level,
        theme: 'assessment',
        durationMinutes: 1,
        content: {
          type: 'question',
          question: q.question,
          options: q.options,
          answer: q.answer,
        },
      },
    });
  }

  // 5. Connect User to some achievements/completions for test simulation

  console.log('Seeding initial completed activities...');
  await prisma.lessonCompletion.create({
    data: {
      tenant_id: tenantId,
      userId: testUser.id,
      lessonId: lesson1.id,
      score: 100,
      xpEarned: 50,
    },
  });

  if (firstStepAchievement) {
    await prisma.userAchievement.create({
      data: {
        tenant_id: tenantId,
        userId: testUser.id,
        achievementId: firstStepAchievement.id,
      },
    });
  }

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
