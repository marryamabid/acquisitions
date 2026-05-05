import aj from '#config/arcjet.js';
import logger from '#config/winston.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;
    let message;
    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin rate limit exceeded is 20 requests per minute';
        break;
      case 'user':
        limit = 10;
        message = 'Admin rate limit exceeded is 10 requests per minute';
        break;
      case 'guest':
        limit = 5;
        message = 'Admin rate limit exceeded is 5 requests per minute';
        break;

      default:
        break;
    }
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        nme: `${role}-rate-limit`,
      })
    );
    const decision = await client.protect(req);
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot detected and blocked', {
        ip: req.ip,
        userAgent: req.get['user-agent'],
        path: req.path,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Automated req is not allowed' });
    }
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shiels blocked req', {
        ip: req.ip,
        userAgent: req.get['user-agent'],
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request is blocked by security policy',
      });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate Limt exceed', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
      });
      return res.status(429).json({ error: 'too many requests', message });
    }
    next();
  } catch (e) {
    console.error('Arcjet error', e);
    res
      .status(500)
      .json({ error: 'inernal server error', message: 'Something went wrong' });
  }
};
