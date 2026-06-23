// middleware/authenticate.js
// This middleware runs BEFORE any protected route handler.
// Its job is simple: check if the request has a valid JWT token.
// If it does → allow the request through and attach the user info to req.user
// If it doesn't → stop the request and return 401 Unauthorized

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // JWT tokens are sent in the "Authorization" header like this:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  const authHeader = req.headers.authorization;

  // Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
    });
  }

  // Extract just the token part (remove the "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify() checks two things:
    // 1. Is the token signed with our JWT_SECRET? (not fake)
    // 2. Has the token expired?
    // If both pass, it returns the payload we stored when creating the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request object
    // Now any route handler can access req.user to know who is logged in
    req.user = decoded;

    // Call next() to pass the request to the actual route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, stop here
    return res.status(401).json({
      error: 'Invalid or expired token. Please log in again.',
    });
  }
}

module.exports = { authenticate };
