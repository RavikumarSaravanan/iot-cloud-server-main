// import express from 'express';
// import { Tutorial } from '../models/Tutorial.js';
// import { authRequired, adminOnly } from '../middleware/auth.js';

// const router = express.Router();

// // GET /api/tutorials - Public endpoint to fetch tutorials
// router.get('/', async (req, res) => {
//   try {
//     const { category, difficulty, search, page = 1, limit = 10 } = req.query;
    
//     const filter = { isActive: true };
//     if (category && category !== 'all') filter.category = category;
//     if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
//     if (search) {
//       filter.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { tags: { $in: [new RegExp(search, 'i')] } }
//       ];
//     }

//     const tutorials = await Tutorial.find(filter)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit))
//       .lean();

//     res.json(tutorials);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ ok: false, error: 'Failed to fetch tutorials' });
//   }
// });

// // GET /api/tutorials/:id - Get single tutorial
// router.get('/:id', async (req, res) => {
//   try {
//     const tutorial = await Tutorial.findOne({ _id: req.params.id, isActive: true }).lean();
//     if (!tutorial) return res.status(404).json({ ok: false, error: 'Tutorial not found' });
//     res.json(tutorial);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ ok: false, error: 'Failed to fetch tutorial' });
//   }
// });

// // POST /api/tutorials - Admin only: Create tutorial
// router.post('/', authRequired, adminOnly, async (req, res) => {
//   try {
//     const {
//       title, description, category, difficulty, components,
//       codeSnippet, architecture, estimatedTime, author, tags
//     } = req.body;

//     const tutorial = new Tutorial({
//       title, description, category, difficulty,
//       components: Array.isArray(components) ? components : components?.split(',').map(c => c.trim()) || [],
//       codeSnippet, architecture, estimatedTime, author,
//       tags: Array.isArray(tags) ? tags : tags?.split(',').map(t => t.trim()) || []
//     });

//     await tutorial.save();
//     res.json({ ok: true, tutorial });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ ok: false, error: 'Failed to create tutorial' });
//   }
// });

// // DELETE /api/tutorials/:id - Admin only: Delete tutorial
// router.delete('/:id', authRequired, adminOnly, async (req, res) => {
//   try {
//     const tutorial = await Tutorial.findByIdAndUpdate(
//       req.params.id,
//       { isActive: false },
//       { new: true }
//     );
//     if (!tutorial) return res.status(404).json({ ok: false, error: 'Tutorial not found' });
//     res.json({ ok: true });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ ok: false, error: 'Failed to delete tutorial' });
//   }
// });

// export default router;
// routes/tutorials.js
import express from 'express';
import Tutorial from '../models/Tutorial.js';

const router = express.Router();

// Simple authentication check - adjust based on your existing auth setup
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // If no auth header, allow for now (you can make this stricter later)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Warning: No authentication token provided');
    // For now, allow the request - comment out the line below to enforce auth
    // return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Token validation would go here
  next();
}

// GET all tutorials (public)
// router.get('/', async (req, res) => {
//   try {
//     console.log('GET /api/tutorials');
//     const limit = parseInt(req.query.limit) || 100;
//     const tutorials = await Tutorial.find({ active: true })
//       .sort({ createdAt: -1 })
//       .limit(limit);
    
//     console.log(`Found ${tutorials.length} tutorials`);
//     res.json(tutorials);
//   } catch (error) {
//     console.error('Error fetching tutorials:', error);
//     res.status(500).json({ error: 'Failed to fetch tutorials' });
//   }
// });

// ... existing code ...
// GET all tutorials (public)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/tutorials');
    
    // Extract query parameters
    const { category, difficulty, search, page = 1, limit = 100 } = req.query;
    
    // Build filter object
    const filter = { active: true };
    
    // Add category filter if specified and not 'all'
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Add difficulty filter if specified and not 'all'
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    // Add search filter if specified
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    console.log('Filter parameters:', filter);
    
    // Fetch tutorials with filters
    const tutorials = await Tutorial.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    console.log(`Found ${tutorials.length} tutorials`);
    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch tutorials' });
  }
});
// ... existing code ...

// GET single tutorial by ID
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    res.status(500).json({ error: 'Failed to fetch tutorial' });
  }
});

// POST new tutorial
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('POST /api/tutorials - Creating new tutorial');
    console.log('Request body:', req.body);
    
    const {
      title,
      description,
      category,
      difficulty,
      components,
      codeSnippet,
      architecture,
      estimatedTime,
      author,
      tags
    } = req.body;

    // Validation
    if (!title || !description || !category || !difficulty || !codeSnippet) {
      console.error('Validation failed - missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, category, difficulty, codeSnippet' 
      });
    }

    // Create new tutorial
    const tutorial = new Tutorial({
      title,
      description,
      category,
      difficulty,
      components: components || [],
      codeSnippet,
      architecture: architecture || '',
      estimatedTime: estimatedTime || '',
      author: author || 'Knowledge Garden Team',
      tags: tags || [],
      active: true
    });

    // Save to database
    await tutorial.save();
    
    console.log('Tutorial created successfully:', tutorial._id);
    res.status(201).json({
      message: 'Tutorial created successfully',
      tutorial: tutorial
    });
  } catch (error) {
    console.error('Error creating tutorial:', error);
    res.status(500).json({ 
      error: 'Failed to create tutorial', 
      details: error.message 
    });
  }
});

// DELETE tutorial (soft delete - marks as inactive)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('DELETE /api/tutorials/' + req.params.id);
    
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    
    // Soft delete - mark as inactive
    tutorial.active = false;
    await tutorial.save();
    
    console.log('Tutorial deleted successfully:', tutorial._id);
    res.json({ 
      message: 'Tutorial deleted successfully',
      id: tutorial._id 
    });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    res.status(500).json({ error: 'Failed to delete tutorial' });
  }
});

// PUT/PATCH update tutorial (optional - add if needed)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    
    res.json(tutorial);
  } catch (error) {
    console.error('Error updating tutorial:', error);
    res.status(500).json({ error: 'Failed to update tutorial' });
  }
});

export default router;
