// prisma/seed.js
// This script fills the database with test data so you can log in and test right away.
// Run it with: npm run seed
// It will create test users, categories, requests, comments, and activities.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // --- Clean old data first ---
  // We delete in reverse order because of foreign key constraints:
  // a child row must be deleted before its parent row
  await prisma.satisfactionRating.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared old data');

  // --- Hash the password ---
  // bcryptjs hashes the password so it's never stored as plain text
  // The number 10 is the "salt rounds" — how many times it scrambles the password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // --- Create test users ---
  const student1 = await prisma.user.create({
    data: {
      name: 'Ahmed Al-Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true, // already verified so we can log in right away
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Sara Al-Student',
      email: 'student2@test.com',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
    },
  });

  const support1 = await prisma.user.create({
    data: {
      name: 'John Support',
      email: 'support@test.com',
      password: hashedPassword,
      role: 'SUPPORT',
      isVerified: true,
    },
  });

  const support2 = await prisma.user.create({
    data: {
      name: 'Sarah Support',
      email: 'support2@test.com',
      password: hashedPassword,
      role: 'SUPPORT',
      isVerified: true,
    },
  });

  console.log('👤 Created users');

  // --- Create sample requests ---

  // Request 1 — open, not assigned yet
  const request1 = await prisma.request.create({
    data: {
      title: 'Cannot access my exam results online',
      description:
        'I have been trying to access my semester exam results on the student portal for 3 days but I keep getting an error message saying "Results not available". My student ID is 2023001.',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'EXAMS',
      studentId: student1.id,
    },
  });

  // Request 2 — in progress, assigned to support1
  const request2 = await prisma.request.create({
    data: {
      title: 'Scholarship payment not received this month',
      description:
        'My scholarship payment for June was supposed to be deposited on the 1st but it has not arrived yet. Please check if there is an issue with my bank details.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      category: 'FINANCIAL',
      studentId: student1.id,
      assignedToId: support1.id,
    },
  });

  // Request 3 — resolved
  const request3 = await prisma.request.create({
    data: {
      title: 'Need medical approval letter for absence',
      description:
        'I was hospitalized for a week in May and I need an official medical approval letter to submit to my professors. I have attached my hospital discharge paper.',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      category: 'MEDICAL_APPROVAL',
      studentId: student2.id,
      assignedToId: support2.id,
    },
  });

  // Request 4 — open
  const request4 = await prisma.request.create({
    data: {
      title: 'English course registration issue',
      description:
        'I am trying to register for the Advanced English Writing course but the system says I do not meet the prerequisites even though I passed English 101 last semester.',
      status: 'OPEN',
      priority: 'MEDIUM',
      category: 'ENGLISH_DEPARTMENT',
      studentId: student2.id,
    },
  });

  // Request 5 — closed
  const request5 = await prisma.request.create({
    data: {
      title: 'Request for official enrollment certificate',
      description:
        'I need an official enrollment certificate for a visa application. Please prepare it with the college stamp.',
      status: 'CLOSED',
      priority: 'LOW',
      category: 'ADMIN',
      studentId: student1.id,
      assignedToId: support1.id,
    },
  });

  console.log('📋 Created requests');

  // --- Add comments ---

  // Comment on request 2 (financial issue)
  await prisma.comment.create({
    data: {
      content: 'I have checked your bank details and everything looks correct. I am now escalating this to the finance department.',
      isInternal: false, // student CAN see this
      authorId: support1.id,
      requestId: request2.id,
    },
  });

  // Internal note on request 2 (only support can see)
  await prisma.comment.create({
    data: {
      content: 'INTERNAL: Finance department has a known delay this month. Should be resolved by June 10.',
      isInternal: true, // ONLY support reps can see this
      authorId: support1.id,
      requestId: request2.id,
    },
  });

  // Student reply on request 2
  await prisma.comment.create({
    data: {
      content: 'Thank you for the update. I will wait and check again on June 10.',
      isInternal: false,
      authorId: student1.id,
      requestId: request2.id,
    },
  });

  // Comment on resolved request 3
  await prisma.comment.create({
    data: {
      content: 'Your medical approval letter has been prepared and sent to your professors. Please check your college email.',
      isInternal: false,
      authorId: support2.id,
      requestId: request3.id,
    },
  });

  console.log('💬 Created comments');

  // --- Add activity logs ---
  // These are auto-generated in the real app, but for seed data we create them manually

  await prisma.activity.create({
    data: {
      action: 'REQUEST_CREATED',
      description: 'Request was created by Ahmed Al-Student',
      userId: student1.id,
      requestId: request1.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: 'REQUEST_CREATED',
      description: 'Request was created by Ahmed Al-Student',
      userId: student1.id,
      requestId: request2.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: 'STATUS_CHANGED',
      description: 'Status changed from Open to In Progress',
      userId: support1.id,
      requestId: request2.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: 'ASSIGNED',
      description: 'Request assigned to John Support',
      userId: support1.id,
      requestId: request2.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: 'STATUS_CHANGED',
      description: 'Status changed from In Progress to Resolved',
      userId: support2.id,
      requestId: request3.id,
    },
  });

  console.log('📜 Created activity logs');

  // --- Add a satisfaction rating for the resolved request ---
  await prisma.satisfactionRating.create({
    data: {
      rating: 5,
      studentId: student2.id,
      requestId: request3.id,
    },
  });

  console.log('⭐ Created satisfaction rating');

  // --- Summary ---
  console.log('\n✅ Seed complete! Here are your test credentials:\n');
  console.log('  👨‍🎓 Student:  student@test.com  / password123');
  console.log('  👨‍🎓 Student2: student2@test.com / password123');
  console.log('  🧑‍💼 Support:  support@test.com  / password123');
  console.log('  🧑‍💼 Support2: support2@test.com / password123');
  console.log('\n  📊 5 requests, 4 comments, 5 activity logs created\n');
}

// Run the seed and close the database connection when done
main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
