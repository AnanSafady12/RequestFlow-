// tests/setup.js
// This file runs before any test file is executed.
// It sets up the test database, overrides environment variables,
// clears the database between tests, and mocks third-party APIs (like email).

const dotenv = require('dotenv');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load the dev .env file to extract host, port, credentials
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Override environment variables for test execution
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_automated_testing_123456';
process.env.PORT = '3001'; // use a different port in test environment

// 3. Dynamically point DATABASE_URL to a separate test database 'requestflow_test'
if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    dbUrl.pathname = '/requestflow_test';
    process.env.DATABASE_URL = dbUrl.toString();
  } catch (err) {
    // Fallback if URL parsing fails
    process.env.DATABASE_URL = 'postgresql://postgres:password123@localhost:5433/requestflow_test';
  }
} else {
  // Hardcoded fallback
  process.env.DATABASE_URL = 'postgresql://postgres:password123@localhost:5433/requestflow_test';
}

// 4. Mock the email utility so tests don't send real emails or crash on missing credentials
jest.mock('../src/utils/sendEmail', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendStatusUpdateEmail: jest.fn().mockResolvedValue(true),
}));

// Import prisma client after env variables have been configured
const prisma = require('../src/config/db');

// A global flag to track if we've already synced the database schema
// Because all tests run sequentially in the same process, we only need to sync once
let schemaSynced = false;

beforeAll(async () => {
  if (!schemaSynced) {
    console.log('🔄 Setting up test database: syncing schema...');
    try {
      // Execute prisma db push to ensure the requestflow_test database exists and is up to date
      execSync('npx prisma db push --accept-data-loss --skip-generate', {
        stdio: 'inherit',
        env: { ...process.env },
      });
      schemaSynced = true;
      console.log('✅ Test database schema is synced successfully');
    } catch (err) {
      console.error('❌ Error syncing test database schema:', err);
      throw err;
    }
  }
});

beforeEach(async () => {
  // Clear the database before each test to guarantee complete test isolation.
  // We delete records in reverse order of database relationships to avoid foreign key conflicts.
  try {
    await prisma.satisfactionRating.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.request.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.error('❌ Error cleaning test database tables:', err);
    throw err;
  }
});

afterAll(async () => {
  // Close the database connection when all tests in this file are done
  await prisma.$disconnect();
});
