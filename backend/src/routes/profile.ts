import express from 'express';
import { getUser, updateUser, getOrCreateUser } from '../services/firebaseService.js';

const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getOrCreateUser(userId);

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    await updateUser(userId, updates);

    res.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
