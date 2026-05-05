import bcrypt from 'bcrypt';
import logger from '#config/winston.js';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';

import { users } from '#models/user.model.js';
export const hashedPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error(`failing in hashing password ${e}`);
    throw e;
  }
};
export const comparePassword = async (password, hashpassword) => {
  try {
    return await bcrypt.compare(password, hashpassword);
  } catch (e) {
    logger.error(`failing in comparing password ${e}`);
    throw e;
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) throw new Error('User already exists');
    const password_hash = await hashedPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, password: password_hash, email, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });
    logger.info(`User created successfully ${newUser.email}`);
    return newUser;
  } catch (e) {
    logger.error(`failing in creating user ${e}`);
    throw e;
  }
};
export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) throw new Error('Invalid email');
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');
    logger.info(`User authenticated successfully ${email}`);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (e) {
    logger.error(`failing in creating user ${e}`);
    throw e;
  }
};
