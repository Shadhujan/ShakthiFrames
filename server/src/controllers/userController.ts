import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password'); // Find all users, exclude password
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Optional: Add logic here to prevent deleting an admin user if you want
      // if (user.role === 'admin') {
      //   res.status(400).json({ success: false, message: 'Cannot delete an admin user' });
      //   return;
      // }
      await user.deleteOne();
      res.status(200).json({ success: true, message: 'User removed' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    // req.user is attached by the 'protect' middleware. We don't need to find them again.
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Update fields if they are provided in the request body
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Optional: Handle password change
    if (req.body.password) {
      // You should add validation (e.g., password length) here
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    // Respond with the updated user data (and a new token if you want to be extra secure)
    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Change user password
 * @route   POST /api/v1/users/change-password
 * @access  Private
 */
export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    // Fetch user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
