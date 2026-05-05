import logger from '#config/winston.js';
import { signinSchema, signupSchema } from '#validations/zod.validation.js';
import { formatValidationError } from '#utils/format.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { jwtToken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationError(validationResult.error),
      });
    }
    const { name, email, role, password } = validationResult.data;
    //auth service
    const user = await createUser({ name, email, password, role });
    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    logger.info(`user registered successfully ${email}`);
    res.status(200).json({
      message: 'User registered',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Sign up error', e);
    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validationResult = signinSchema.safeParse({ email, password });
    if (!validationResult) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationError(validationResult.error),
      });
    }
    const user = await authenticateUser({ email, password });
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);
    logger.info(`user signed in successfully ${email}`);
    res.status(200).json({
      message: 'User signed in',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Sign in error', e);
    next(e);
  }
};
export const signout = (req, res, next) => {
  try {
    cookies.clear(res, 'token');
    logger.info('user signed out successfully ');
    res.status(200).json({
      message: 'User signed out',
    });
  } catch (e) {
    logger.error('Sign out error', e);
    next(e);
  }
};
