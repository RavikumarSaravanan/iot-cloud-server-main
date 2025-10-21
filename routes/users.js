// routes/users.js
import express from 'express';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordHash')
      .populate('bookmarks')
      .populate('completedTutorials.tutorial')
      .populate('enrolledPaths.path');
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authRequired, async (req, res) => {
  try {
    const { fullName, bio, profileImage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, bio, profileImage },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Mark tutorial as completed
router.post('/tutorials/:tutorialId/complete', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.addCompletedTutorial(req.params.tutorialId);
    
    res.json({ message: 'Tutorial marked as completed' });
  } catch (error) {
    console.error('Error marking tutorial as completed:', error);
    res.status(500).json({ error: 'Failed to mark tutorial as completed' });
  }
});

// Get user's bookmarked tutorials
router.get('/bookmarks', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarks');
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Get user's completed tutorials
router.get('/completed', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedTutorials.tutorial');
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.completedTutorials);
  } catch (error) {
    console.error('Error fetching completed tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch completed tutorials' });
  }
});

export default router;