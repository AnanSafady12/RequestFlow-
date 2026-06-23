const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- USER ACCOUNTS ---');
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log(users);

  console.log('--- RECENT REQUESTS ---');
  const requests = await prisma.request.findMany({
    include: {
      student: { select: { name: true, email: true } },
      assignedTo: { select: { name: true, email: true } },
      attachments: true,
      activities: true,
      comments: true
    }
  });
  console.log(JSON.stringify(requests, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
