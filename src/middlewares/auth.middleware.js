import logger from '#config/winston.js';
import { jwtToken } from '#utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'No token provided' });
    }
    const decoded = jwtToken.verify(token);
    if (!decoded) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Invalid token' });
    }
    req.user = decoded;
    logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
    next();
  } catch (e) {
    logger.error(`Error in authenticateUser middleware: ${e.message}`);
    next(e);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Error during role verification',
    });
  }
};

export const authorizeRole = allowedRoles => (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'No user authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${allowedRoles.join(', ')}`
      );
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions',
      });
    }
  } catch (e) {
    logger.error(`Error in authorizeRole middleware: ${e.message}`);
    next(e);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Error during role verification',
    });
  }
};
