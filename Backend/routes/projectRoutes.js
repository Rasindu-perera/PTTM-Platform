const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Get all projects
// GET /api/projects
// Allowed: 'admin', 'project_manager', 'team_member'
router.get(
  '/', 
  verifyToken, 
  checkRole(['admin', 'project_manager', 'team_member']), 
  projectController.getAllProjects
);

// Create a project
// POST /api/projects
// Allowed: 'admin', 'project_manager'
router.post(
  '/', 
  verifyToken, 
  checkRole(['admin', 'project_manager']), 
  projectController.createProject
);

// Update a project
// PUT /api/projects/:id
// Allowed: 'admin', 'project_manager'
router.put(
  '/:id', 
  verifyToken, 
  checkRole(['admin', 'project_manager']), 
  projectController.updateProject
);

// Delete a project
// DELETE /api/projects/:id
// Allowed: 'admin'
router.delete(
  '/:id', 
  verifyToken, 
  checkRole(['admin']), 
  projectController.deleteProject
);

module.exports = router;
