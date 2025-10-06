import express from 'express';
import multer from 'multer';
import path from 'path';
import { Project } from '../models/Project.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { cleanStr } from '../utils/validate.js';

const router = express.Router();

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safe = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
    cb(null, safe);
  }
});

function fileFilter(req, file, cb) {
  const ok = /image\/(jpeg|png|webp)/.test(file.mimetype || '');
  cb(ok ? null : new Error('Only JPG/PNG/WebP are allowed'), ok);
}

// Bump limit to 5 MB and keep strict types
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// --- Routes ---

router.get('/', async (req, res) => {
  const items = await Project.find({}).sort({ createdAt: -1 }).lean();
  res.json(items);
});

// Handle Multer errors gracefully and return helpful 4xx
router.post('/', authRequired, adminOnly, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      // Map Multer errors to 400 with a clear message
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large (max 5 MB)'
          : err.message || 'Upload failed';
      return res.status(400).json({ ok: false, error: msg });
    }

    try {
      const p = new Project({
        title: cleanStr(req.body.title, 160),
        track: req.body.track,
        authors: cleanStr(req.body.authors, 240),
        desc: cleanStr(req.body.desc, 1000),
        url: cleanStr(req.body.url, 500), // Add URL field processing
        img: req.file ? '/uploads/' + req.file.filename : undefined
      });
      await p.save();
      res.json({ ok: true, id: p._id });
    } catch (e) {
      console.error('Project create failed:', e);
      res.status(500).json({ ok: false, error: 'Server error while saving project' });
    }
  });
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const { id } = req.params;
  await Project.findByIdAndDelete(id);
  res.json({ ok: true });
});

export default router;
