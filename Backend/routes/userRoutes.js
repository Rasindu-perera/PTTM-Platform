const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Get all users - Accessible by admin and project_manager
router.get('/', verifyToken, checkRole(['admin', 'project_manager']), getAllUsers);

// Update user role - Accessible by admin only
router.put('/:id/role', verifyToken, checkRole(['admin']), updateUserRole);

// Delete user - Accessible by admin only
router.delete('/:id', verifyToken, checkRole(['admin']), deleteUser);

module.exports = router;
