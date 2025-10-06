import express from 'express';
import { Project } from '../models/Project.js';
import { Notification } from '../models/Notification.js';
import { Join } from '../models/Join.js';

const router = express.Router();

router.get('/gallery', async (req, res) => {
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit)||50));
  const items = await Project.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  res.json(items);
});

router.get('/stats', async (req, res) => {
  const [learners, mentors, partners] = await Promise.all([
    Join.countDocuments({ role:'learner' }),
    Join.countDocuments({ role:'mentor' }),
    Join.countDocuments({ role:'partner' })
  ]);
  res.json({ learners, mentors, partners });
});

router.post('/join', async (req, res) => {
  const j = new Join({
    role: req.body.role,
    fullName: (req.body.fullName||'').toString(),
    email: (req.body.email||'').toString(),
    phone: (req.body.phone||'').toString(),
    extra: (req.body.extra||'').toString(),
    message: (req.body.message||'').toString(),
  });
  await j.save();
  res.json({ ok:true });
});

export default router;
