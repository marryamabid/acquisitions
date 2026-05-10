import { db } from '#config/database.js';
import logger from '#config/winston.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (e) {
    logger.error(`Error in getAllUsers: ${e.message}`);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  } catch (e) {
    logger.error(`Error in getUserById: ${e.message}`);
    throw e;
  }
};

export const updateUserById = async (id, updates) => {
  try {
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    if (updates.email && updates.email !== existingUser.email) {
      const emailUser = await db
        .select({
          email: users.email,
          name: users.name,
          role: users.role,
          created_at: users.created_at,
          updated_at: users.updated_at,
        })
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);
      if (emailUser) {
        throw new Error('Email already exists');
      }
    }
    const updatedData = {
      ...updates,
      updated_at: new Date(),
    };
    const updatedUser = await db
      .update(users)
      .set(updatedData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });
    return updatedUser;
  } catch (e) {
    logger.error(`Error in updateUserById: ${e.message}`);
    throw e;
  }
};

export const deleteUserById = async id => {
  try {
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    logger.info(`User ${deletedUser.email} deleted successfully`);
    return deletedUser;
  } catch (e) {
    logger.error(`Error in deleteUserById: ${e.message}`);
    throw e;
  }
};
