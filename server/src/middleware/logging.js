// middleware/logging.js
// Custom logging middleware that records details of every API call.
// It logs: method, URL, user ID (if logged in), status code, and response time.
// Since authentication runs after global middlewares, we listen to the response 'finish' event
// so that req.user is populated by the time we log.

function requestLogger(req, res, next) {
  const start = Date.now();

  // Listen to the response finish event (emitted when response has been sent to client)
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;
    const userId = req.user ? req.user.id : 'anonymous';
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${method} ${url} | Status: ${status} | User: ${userId} | Duration: ${duration}ms`
    );
  });

  next();
}

module.exports = { requestLogger };
