const db = require('../config/db');

/**
 * Create a new project
 * POST /api/projects
 */
const createProject = async (req, res) => {
  const { name, description, manager_id } = req.body;
  
  try {
    const insertQuery = `
      INSERT INTO projects (name, description, manager_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    // If manager_id is not provided, default to the user creating the project
    const result = await db.query(insertQuery, [name, description, manager_id || req.user.id]);

    res.status(201).json({
      message: 'Project created successfully',
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all projects
 * GET /api/projects
 */
const getAllProjects = async (req, res) => {
  try {
    const { id, role } = req.user;
    let query = '';
    let params = [];

    if (role === 'admin' || role === 'project_manager') {
      // Admins and Project Managers can see all projects
      query = 'SELECT * FROM projects ORDER BY created_at DESC';
    } else if (role === 'team_member') {
      // Team Members only see projects they are assigned to via project_members pivot table
      query = `
        SELECT p.* 
        FROM projects p
        INNER JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [id];
    }

    const result = await db.query(query, params);
    res.status(200).json({ projects: result.rows });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a project
 * PUT /api/projects/:id
 */
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, manager_id } = req.body;

  try {
    // Check if project exists
    const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateQuery = `
      UPDATE projects 
      SET name = COALESCE($1, name), 
          description = COALESCE($2, description), 
          manager_id = COALESCE($3, manager_id)
      WHERE id = $4
      RETURNING *
    `;
    const result = await db.query(updateQuery, [name, description, manager_id, id]);

    res.status(200).json({
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a project
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    // We rely on PostgreSQL ON DELETE CASCADE to remove associated tasks and project_members
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject
};
