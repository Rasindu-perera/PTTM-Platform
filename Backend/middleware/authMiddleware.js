const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches the decoded user payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_temporary_secret');
    
    // Attach the user payload to the request object
    req.user = decoded;
    
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Checks if the authenticated user's role is included in the allowed roles array.
 * 
 * @param {Array<string>} roles - Array of allowed roles (e.g., ['admin', 'project_manager'])
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // Ensure req.user exists (verifyToken must be called before this middleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' });
    }

    next(); // User has the required role, proceed
  };
};

module.exports = {
  verifyToken,
  checkRole
};
