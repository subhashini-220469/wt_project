import express from 'express';
import authenticateUser from '../middleware/authenticateUser.js';
import User from '../models/user.js';

const router = express.Router();

// GET: Fetch user profile
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// PUT: Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
    try {
        const { username, officeName } = req.body;
        
        const updateData = {};
        if (username) updateData.username = username;
        if (officeName !== undefined) updateData.officeName = officeName; // could be empty string

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

export default router;
