import logger from '#config/winston.js';
import {
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from '#services/getAllUsers.js';
import { formatValidationError } from '#utils/format.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';

export const getAllUsersController = async (req, res, next) => {
  try {
    logger.info('Fetching all users');
    const allUsers = await getAllUsers();
    res.status(200).json({
      user: allUsers,
      message: 'Users fetched successfully',
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(`Error in getAllUsersController: ${error.message}`);
    next(error);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    logger.info(`Fetching user with id: ${req.params.id}`);
    const validationResult = userIdSchema.safeParse({ id: req.params.id });
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'validation failed',
        details: formatValidationError(validationResult.error),
      });
    }
    const { id } = validationResult.data;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      user,
      message: 'User fetched successfully',
    });
  } catch (e) {
    logger.error(`Error in getUserByIdController: ${e.message}`);
    next(e);
  }
};
//authorization also checked

export const updateUserByIdController = async (req, res, next) => {
  try {
    logger.info(`Updating user with id: ${req.params.id}`);
    const validationId = userIdSchema.safeParse({ id: req.params.id });
    if (!validationId.success) {
      return res.status(400).json({
        message: 'validation failed',
        details: formatValidationError(validationId.error),
      });
    }
    const validationUpdates = updateUserSchema.safeParse(req.body);
    if (!validationUpdates.success) {
      return res.status(400).json({
        message: 'validation failed',
        details: formatValidationError(validationUpdates.error),
      });
    }
    const { id } = validationId.data;
    const updates = validationUpdates.data;
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = Number(id);
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admin can update other user or user can update itself',
      });
    }
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update role' });
    }
    const updatedUser = await updateUserById(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (e) {
    logger.error(`Error in updateUserByIdController: ${e.message}`);
    next(e);
  }
};

export const deleteUserByIdController = async (req, res, next) => {
  try {
    logger.info(`deleting user with id: ${req.params.id}`);
    const validationId = userIdSchema.safeParse({ id: req.params.id });
    if (!validationId.success) {
      return res.status(400).json({
        message: 'validation failed',
        details: formatValidationError(validationId.error),
      });
    }
    const { id } = validationId.data;
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete user' });
    }
    const userId = Number(id);
    if (req.user.id === userId) {
      return res.status(403).json({ error: 'Admin cannot delete itself' });
    }
    const deletedUser = await deleteUserById(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      user: deletedUser,
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error(`Error in deleteUserByIdController: ${e.message}`);
    next(e);
  }
};
