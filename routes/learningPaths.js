// routes/learningPaths.js
import express from 'express';
import { LearningPath } from '../models/LearningPath.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET all learning paths (public)
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    const filter = { active: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const paths = await LearningPath.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'email fullName')
      .populate('tutorials');
    
    res.json(paths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ error: 'Failed to fetch learning paths' });
  }
});

// GET single learning path
router.get('/:id', async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id)
      .populate('createdBy', 'email fullName')
      .populate('tutorials');
      
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }
    
    res.json(path);
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({ error: 'Failed to fetch learning path' });
  }
});

// POST new learning path (admin only)
router.post('/', authRequired, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      estimatedTime,
      tutorials
    } = req.body;

    // Validation
    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, category, difficulty' 
      });
    }

    const path = new LearningPath({
      title,
      description,
      category,
      difficulty,
      estimatedTime: estimatedTime || '',
      tutorials: tutorials || [],
      createdBy: req.user.id,
      active: true
    });

    await path.save();
    
    res.status(201).json({
      message: 'Learning path created successfully',
      path
    });
  } catch (error) {
    console.error('Error creating learning path:', error);
    res.status(500).json({ 
      error: 'Failed to create learning path', 
      details: error.message 
    });
  }
});

// DELETE learning path (admin only)
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Learning path not found' });
    }
    
    path.active = false;
    await path.save();
    
    res.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    res.status(500).json({ error: 'Failed to delete learning path' });
  }
});

export default router;