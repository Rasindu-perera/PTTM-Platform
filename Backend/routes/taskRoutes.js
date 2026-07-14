const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Create a new task
// POST /api/tasks
// Allowed: 'project_manager'
router.post(
  '/', 
  verifyToken, 
  checkRole(['project_manager']), 
  taskController.createTask
);

// Get all tasks
// GET /api/tasks
// Allowed: 'admin', 'project_manager'
router.get(
  '/', 
  verifyToken, 
  checkRole(['admin', 'project_manager']), 
  taskController.getAllTasks
);

// Get all tasks for a specific project
// GET /api/tasks/project/:projectId
// Allowed: 'admin', 'project_manager', 'team_member'
router.get(
  '/project/:projectId', 
  verifyToken, 
  checkRole(['admin', 'project_manager', 'team_member']), 
  taskController.getTasksByProject
);

// Update only the status of a task
// PUT /api/tasks/:id/status
// Allowed: 'admin', 'project_manager', 'team_member'
router.put(
  '/:id/status', 
  verifyToken, 
  checkRole(['admin', 'project_manager', 'team_member']), 
  taskController.updateTaskStatus
);

// Delete a task
// DELETE /api/tasks/:id
// Allowed: 'admin', 'project_manager'
router.delete(
  '/:id', 
  verifyToken, 
  checkRole(['admin', 'project_manager']), 
  taskController.deleteTask
);

module.exports = router;
