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

  // 2. Create Achievements
  console.log('Seeding achievements...');
  const firstStepAchievement = await prisma.achievement.create({
    data: {
      name: 'First Step',
      description: 'Complete your first lesson',
      iconUrl: 'https://assets.linguoup.com/icons/first-step.png',
      xpReward: 50,
      criteria: { lessonsCompleted: 1 },
    },
  });

  await prisma.achievement.create({
    data: {
      name: 'Streak Starter',
      description: 'Reach a 3-day active learning streak',
      iconUrl: 'https://assets.linguoup.com/icons/streak-3.png',
      xpReward: 100,
      criteria: { streakDays: 3 },
    },
  });

  await prisma.achievement.create({
    data: {
      name: 'XP Collector',
      description: 'Earn a total of 500 XP',
      iconUrl: 'https://assets.linguoup.com/icons/xp-500.png',
      xpReward: 200,
      criteria: { totalXP: 500 },
    },
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

  await prisma.userAchievement.create({
    data: {
      tenant_id: tenantId,
      userId: testUser.id,
      achievementId: firstStepAchievement.id,
    },
  });

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
