import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { isAdmin, authorize } from '../middleware/rbac.js';

const router = express.Router();

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { organization, role, isActive, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (organization) query.organization = organization;
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only view their own profile unless they're admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin or Self)
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { username, email, role, organization, isActive } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check authorization: users can update themselves, admins can update anyone
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdminUser = req.user.role === 'admin';

    if (!isSelf && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Only admins can update role, organization, and isActive
    if (isAdminUser) {
      if (role !== undefined) user.role = role;
      if (organization !== undefined) user.organization = organization;
      if (isActive !== undefined) user.isActive = isActive;
    }

    // Users can update their own username and email
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

/**
 * @desc    Delete/Deactivate user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

/**
 * @desc    Get users by organization
 * @route   GET /api/users/organization/:org
 * @access  Private
 */
router.get('/organization/:org', protect, async (req, res) => {
  try {
    // Users can only view users from their own organization unless they're admin
    if (req.user.organization !== req.params.org && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view users from this organization'
      });
    }

    const users = await User.find({ organization: req.params.org })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users: users.map(user => user.toPublicJSON())
      }
    });
  } catch (error) {
    console.error('Get users by organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

export default router;

