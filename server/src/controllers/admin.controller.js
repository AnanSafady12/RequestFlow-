const adminService = require('../services/admin.service');

// Simple authorization check
function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getAllRequests(req, res, next) {
  try {
    const requests = await adminService.getAllRequests();
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

async function deleteRequest(req, res, next) {
  try {
    await adminService.deleteRequest(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAdmin,
  getAllUsers,
  deleteUser,
  getAllRequests,
  deleteRequest,
};
