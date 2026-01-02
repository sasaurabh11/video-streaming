import User from '../models/User.js';

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const { organization, role, search } = req.query;
    
    const query = {};
    
    // Admin can see all users in their organization or all if super admin
    if (req.user.role === 'admin' && req.user.organization !== 'super') {
      query.organization = req.user.organization;
    }
    
    if (organization) query.organization = organization;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users, total: users.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be viewer, editor, or admin'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if admin can modify this user (same organization)
    if (req.user.organization !== 'super' && user.organization !== req.user.organization) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify users from different organizations'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: user.toPublicJSON() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.organization !== 'super' && user.organization !== req.user.organization) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify users from different organizations'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: user.toPublicJSON() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};