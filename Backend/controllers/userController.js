const db = require('../config/db');

/**
 * Get all users
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
  try {
    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
    const result = await db.query(query);
    
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update User Role
 * PUT /api/users/:id/role
 */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['admin', 'project_manager', 'team_member'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role specified." });
  }

  try {
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User role updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete User
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser
};
