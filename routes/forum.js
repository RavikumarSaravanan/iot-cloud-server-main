// routes/forum.js
import express from 'express';
import { ForumPost } from '../models/ForumPost.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// GET all forum posts
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const posts = await ForumPost.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('author', 'email fullName')
      .populate('replies.author', 'email fullName');
    
    // Increment view count for each post (simplified approach)
    await Promise.all(posts.map(async (post) => {
      post.views += 1;
      await post.save();
    }));
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Failed to fetch forum posts' });
  }
});

// GET single forum post
router.get('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'email fullName')
      .populate('replies.author', 'email fullName');
      
    if (!post) {
      return res.status(404).json({ error: 'Forum post not found' });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching forum post:', error);
    res.status(500).json({ error: 'Failed to fetch forum post' });
  }
});

// POST new forum post
router.post('/', authRequired, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags
    } = req.body;

    // Validation
    if (!title || !content || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content, category' 
      });
    }

    const post = new ForumPost({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.id
    });

    await post.save();
    
    // Populate author info before sending response
    await post.populate('author', 'email fullName');
    
    res.status(201).json({
      message: 'Forum post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ 
      error: 'Failed to create forum post', 
      details: error.message 
    });
  }
});

// Add reply to forum post
router.post('/:id/reply', authRequired, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }
    
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Forum post not found' });
    }
    
    if (post.locked) {
      return res.status(400).json({ error: 'This post is locked and cannot receive replies' });
    }
    
    post.replies.push({
      author: req.user.id,
      content
    });
    
    await post.save();
    
    // Populate author info for the new reply
    await post.populate('replies.author', 'email fullName');
    
    res.json({
      message: 'Reply added successfully',
      post
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// DELETE forum post (author or admin only)
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Forum post not found' });
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    await post.remove();
    
    res.json({ message: 'Forum post deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ error: 'Failed to delete forum post' });
  }
});

export default router;