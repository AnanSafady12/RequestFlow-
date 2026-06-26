const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/authenticate');

const router = Router();

// Apply authentication to all admin routes
router.use(authenticate);
// Apply ADMIN role check to all admin routes
router.use(adminController.requireAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Request Management
router.get('/requests', adminController.getAllRequests);
router.delete('/requests/:id', adminController.deleteRequest);

module.exports = router;
