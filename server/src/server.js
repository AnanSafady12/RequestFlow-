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
const path = require('path');

// Load the .env file so process.env has all our config values
dotenv.config();

const app = express();

// Create an HTTP server that wraps Express.
// We need this so Socket.io can attach to the same server in Stage 6.
const httpServer = createServer(app);

// Initialize Socket.io real-time engine
const { initSocket } = require('./sockets/socket');
initSocket(httpServer);

// ─────────────────────────────────────────────
// MIDDLEWARE — code that runs on EVERY request
// before it reaches the route handler
// ─────────────────────────────────────────────

// helmet adds security headers to every response automatically
// We disable contentSecurityPolicy because Swagger UI uses inline scripts and styles that would otherwise be blocked by the browser.
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

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

// Custom request logger — captures user ID, method, URL, status, and duration
const { requestLogger } = require('./middleware/logging');
app.use(requestLogger);

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
// SWAGGER API DOCUMENTATION SETUP
// Swagger reads the JSDoc comments in our route files
// and generates an interactive API docs page at /api/docs
// ─────────────────────────────────────────────

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RequestFlow API',
      version: '1.0.0',
      description: 'Support Request Management System for College Students',
    },
    servers: [{ url: '/api' }],
    // This tells Swagger that protected routes need a Bearer token
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Tell Swagger where to find the JSDoc comments (in all route files)
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Auth routes — register, login, verify code, resend code, get me
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Request routes — full CRUD, search, filter, file upload support
const requestRoutes = require('./routes/request.routes');
app.use('/api/requests', requestRoutes);

// Dashboard routes — statistics, SLA metrics, agent ratings
const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

// Notification routes — list and mark read states
const notificationRoutes = require('./routes/notification.routes');
app.use('/api/notifications', notificationRoutes);

// Serve the uploads directory statically so files can be accessed or downloaded
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 RequestFlow server running on http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`❤️  Health:  http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
  });
}

// Export for Jest testing — tests need to import the server
module.exports = { app, httpServer };
