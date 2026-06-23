// middleware/authorize.js
// This middleware runs AFTER authenticate.js.
// authenticate checks IF the user is logged in.
// authorize checks IF the logged-in user has the RIGHT role.
//
// Usage example:
//   router.patch('/requests/:id', authenticate, authorize('SUPPORT'), updateRequest)
//   → only support reps can update requests
//
//   authorize('STUDENT', 'SUPPORT') → both roles are allowed

function authorize(...roles) {
  // We return a middleware function that captures the allowed roles
  return (req, res, next) => {
    // req.user was set by authenticate.js
    // If for some reason it's missing, stop here
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated.',
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        // 403 = Forbidden (you are logged in, but not allowed to do this)
        error: `Access denied. This action requires one of these roles: ${roles.join(', ')}`,
      });
    }

    // Role is allowed — pass the request to the route handler
    next();
  };
}

module.exports = { authorize };
