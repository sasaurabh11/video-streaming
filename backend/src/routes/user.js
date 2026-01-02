import express from 'express';
import { getAllUsers, updateUserRole, toggleUserStatus } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin, canEdit } from '../middleware/rbac.js';

const router = express.Router();

// Allow editors and admins to get users list (for video assignment)
router.get('/', protect, canEdit, getAllUsers);
router.patch('/:id/role', protect, isAdmin, updateUserRole);
router.patch('/:id/status', protect, isAdmin, toggleUserStatus);

export default router;

