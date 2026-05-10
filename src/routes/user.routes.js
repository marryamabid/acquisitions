import {
  deleteUserByIdController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
} from '#controllers/user.controller.js';
import { authenticateToken } from '#middlewares/auth.middleware.js';
import express from 'express';
const router = express.Router();

router.get('/', authenticateToken, getAllUsersController);
router.get('/:id', authenticateToken, getUserByIdController);
router.put('/:id', authenticateToken, updateUserByIdController);
router.delete('/:id', authenticateToken, deleteUserByIdController);
export default router;
