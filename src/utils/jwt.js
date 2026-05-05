import jwt from 'jsonwebtoken';
import logger from '#config/winston.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
const JWT_EXPIRES_IN = '1d';

export const jwtToken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (e) {
      logger.error('failed to authenticate error', e);
      throw new Error('Failed to authenticate error', e);
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      logger.error('failed to authenticate error', e);
      throw new Error('Failed to authenticate error', e);
    }
  },
};
