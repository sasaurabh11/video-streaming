import express from 'express';
import { getAllUsers, updateUserRole, toggleUserStatus } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', protect, isAdmin, getAllUsers);
router.patch('/:id/role', protect, isAdmin, updateUserRole);
router.patch('/:id/status', protect, isAdmin, toggleUserStatus);

export default router;
