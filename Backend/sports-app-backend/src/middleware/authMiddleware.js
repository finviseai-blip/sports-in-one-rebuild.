// Authentication and role authorization middleware.
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'A Bearer token is required' });
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(503).json({ error: 'Authentication is not configured on this server' });
  }

  try {
    req.user = jwt.verify(match[1], process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

exports.requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication is required' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to perform this action' });
  }
  return next();
};
