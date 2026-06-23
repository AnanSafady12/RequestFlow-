// server.js
// This is the main entry point of the backend.
// It creates the Express app, applies all middleware,
// connects the routes, and starts listening for requests.

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const dotenv = require('dotenv');

// Load the .env file so process.env has all our config values
dotenv.config();

const app = express();

// Create an HTTP server that wraps Express.
// We need this so Socket.io can attach to the same server in Stage 6.
const httpServer = createServer(app);

// ─────────────────────────────────────────────
// MIDDLEWARE — code that runs on EVERY request
// before it reaches the route handler
// ─────────────────────────────────────────────

// helmet adds security headers to every response automatically
// It protects against common web attacks (XSS, clickjacking, etc.)
app.use(helmet());

// cors allows our React frontend to make requests to this backend
// Without this, the browser would block all API calls from a different port
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // allow cookies and auth headers
  })
);

// express.json() reads the body of incoming requests and parses JSON
// Without this, req.body would be undefined
app.use(express.json());

// morgan logs every request to the terminal in a readable format
// Example: POST /api/auth/login 200 45ms
// Only log in development mode — not in production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiter — limits how many requests one IP can make per minute
// This prevents spam and brute-force attacks on login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100,                  // max 100 requests per 15 minutes per IP
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, // send rate limit info in response headers
  legacyHeaders: false,
});
app.use('/api', limiter); // apply only to API routes

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────

// A simple route to check if the server is running
// Open http://localhost:3000/api/health to test it
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'RequestFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// ROUTES — will be imported and connected in later stages
// ─────────────────────────────────────────────

// Placeholder — routes will be added in Stage 2, 3, 4, 5
// app.use('/api/auth', authRoutes);
// app.use('/api/requests', requestRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// ─────────────────────────────────────────────
// 404 HANDLER — catches requests to unknown routes
// ─────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// This catches any error thrown inside a route or middleware.
// Instead of crashing the server, it returns a clean JSON error.
// The 4 parameters (err, req, res, next) tell Express this is an error handler.
// ─────────────────────────────────────────────

app.use((err, req, res, next) => {
  // Log the full error in the terminal for debugging
  console.error('❌ Server error:', err.stack);

  // Send a clean error response to the client
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server.',
    // Only show the full stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`\n🚀 RequestFlow server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health:  http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});

// Export for Jest testing — tests need to import the server
module.exports = { app, httpServer };
