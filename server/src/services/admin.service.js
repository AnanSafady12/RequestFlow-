const prisma = require('../config/db');

async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function deleteUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  if (user.role === 'ADMIN') {
    const error = new Error('Admin accounts cannot be deleted');
    error.status = 403;
    throw error;
  }

  return prisma.user.delete({
    where: { id: userId },
  });
}

async function getAllRequests() {
  return prisma.request.findMany({
    include: {
      student: { select: { name: true, email: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function deleteRequest(requestId) {
  return prisma.request.delete({
    where: { id: requestId },
  });
}

module.exports = {
  getAllUsers,
  deleteUser,
  getAllRequests,
  deleteRequest,
};
