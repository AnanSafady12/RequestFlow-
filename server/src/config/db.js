// config/db.js
// This file creates a single Prisma client instance and exports it.
// Prisma is our ORM — it lets us talk to the PostgreSQL database
// using JavaScript instead of writing raw SQL queries.
// We use a single instance (not a new one each time) to avoid
// opening too many database connections.

const { PrismaClient } = require('@prisma/client');

// Create one Prisma client that the whole app will share
const prisma = new PrismaClient();

module.exports = prisma;
