<<<<<<< HEAD
import express from 'express';
import { Tutorial } from '../models/Tutorial.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tutorials - Public endpoint to fetch tutorials
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const tutorials = await Tutorial.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    res.json(tutorials);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch tutorials' });
  }
});

// GET /api/tutorials/:id - Get single tutorial
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!tutorial) return res.status(404).json({ ok: false, error: 'Tutorial not found' });
    res.json(tutorial);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch tutorial' });
  }
});

// POST /api/tutorials - Admin only: Create tutorial
router.post('/', authRequired, adminOnly, async (req, res) => {
  try {
    const {
      title, description, category, difficulty, components,
      codeSnippet, architecture, estimatedTime, author, tags
    } = req.body;

    const tutorial = new Tutorial({
      title, description, category, difficulty,
      components: Array.isArray(components) ? components : components?.split(',').map(c => c.trim()) || [],
      codeSnippet, architecture, estimatedTime, author,
      tags: Array.isArray(tags) ? tags : tags?.split(',').map(t => t.trim()) || []
    });

    await tutorial.save();
    res.json({ ok: true, tutorial });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to create tutorial' });
  }
});

// DELETE /api/tutorials/:id - Admin only: Delete tutorial
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!tutorial) return res.status(404).json({ ok: false, error: 'Tutorial not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to delete tutorial' });
  }
});

=======
import express from 'express';
import { Tutorial } from '../models/Tutorial.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tutorials - Public endpoint to fetch tutorials
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const tutorials = await Tutorial.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    res.json(tutorials);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch tutorials' });
  }
});

// GET /api/tutorials/:id - Get single tutorial
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!tutorial) return res.status(404).json({ ok: false, error: 'Tutorial not found' });
    res.json(tutorial);
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to fetch tutorial' });
  }
});

// POST /api/tutorials - Admin only: Create tutorial
router.post('/', authRequired, adminOnly, async (req, res) => {
  try {
    const {
      title, description, category, difficulty, components,
      codeSnippet, architecture, estimatedTime, author, tags
    } = req.body;

    const tutorial = new Tutorial({
      title, description, category, difficulty,
      components: Array.isArray(components) ? components : components?.split(',').map(c => c.trim()) || [],
      codeSnippet, architecture, estimatedTime, author,
      tags: Array.isArray(tags) ? tags : tags?.split(',').map(t => t.trim()) || []
    });

    await tutorial.save();
    res.json({ ok: true, tutorial });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to create tutorial' });
  }
});

// DELETE /api/tutorials/:id - Admin only: Delete tutorial
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!tutorial) return res.status(404).json({ ok: false, error: 'Tutorial not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to delete tutorial' });
  }
});

>>>>>>> ffe8e6a (Initial commit)
export default router;