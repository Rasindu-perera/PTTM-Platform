const db = require('../config/db');
const { sendTaskAssignmentEmail } = require('../utils/emailService');

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res) => {
  const { project_id, title, description, assigned_to_id, status } = req.body;
  
  // Convert empty strings to null for database integer fields
  const finalProjectId = project_id ? parseInt(project_id, 10) : null;
  const finalAssignedToId = assigned_to_id ? parseInt(assigned_to_id, 10) : null;

  try {
    const insertQuery = `
      INSERT INTO tasks (project_id, title, description, assigned_to_id, status)
      VALUES ($1, $2, $3, $4, COALESCE($5, 'pending')::task_status)
      RETURNING *
    `;
    // We use COALESCE so if status is not provided, it defaults to 'pending'
    const result = await db.query(insertQuery, [finalProjectId, title, description, finalAssignedToId, status]);

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    });

    // --- Send Email Notification Asynchronously ---
    if (finalAssignedToId) {
      try {
        const userResult = await db.query('SELECT email FROM users WHERE id = $1', [finalAssignedToId]);
        const projectResult = await db.query('SELECT name FROM projects WHERE id = $1', [project_id]);
        
        if (userResult.rows.length > 0 && projectResult.rows.length > 0) {
          const userEmail = userResult.rows[0].email;
          const projectName = projectResult.rows[0].name;
          
          // Fire and forget - do not block the API response
          sendTaskAssignmentEmail(userEmail, title, projectName);
        }
      } catch (err) {
        console.error('Error fetching details for email notification:', err);
      }
    }
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: error.message || 'Internal server error', details: error.stack });
  }
};

/**
 * Get all tasks for a specific project
 * GET /api/tasks/project/:projectId
 */
const getTasksByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const query = `
      SELECT tasks.*, users.name AS assigned_to_name 
      FROM tasks 
      LEFT JOIN users ON tasks.assigned_to_id = users.id 
      WHERE project_id = $1 
      ORDER BY tasks.created_at DESC
    `;
    const result = await db.query(query, [projectId]);
    
    res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all tasks (for PMs and Admins)
 * GET /api/tasks
 */
const getAllTasks = async (req, res) => {
  try {
    const query = `
      SELECT tasks.*, users.name AS assigned_to_name 
      FROM tasks 
      LEFT JOIN users ON tasks.assigned_to_id = users.id 
      ORDER BY tasks.created_at DESC
    `;
    const result = await db.query(query);
    
    res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update only the status of a task
 * PUT /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;

  // Enforce valid status values
  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: "Invalid status. Must be 'pending', 'in_progress', or 'completed'." 
    });
  }

  try {
    // Retrieve the existing task to check permissions
    const taskResult = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Role-based logic: team_members can only update tasks assigned to them
    if (user.role === 'team_member') {
      if (task.assigned_to_id !== user.id) {
        return res.status(403).json({ 
          error: 'Access denied. You can only update tasks assigned to you.' 
        });
      }
    }

    // Update the status (timestamp is handled by postgres trigger)
    const updateQuery = 'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(updateQuery, [status, id]);

    res.status(200).json({
      message: 'Task status updated successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getAllTasks,
  updateTaskStatus,
  deleteTask
};
