import express from 'express';
import { Notification } from '../models/Notification.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { cleanStr } from '../utils/validate.js';

const router = express.Router();

// GET list with optional filters: search, cat, today, page, limit
router.get('/', async (req, res) => {
  const { search='', cat='', today='', page='1', limit='50' } = req.query;
  const q = {};
  if(cat && ['event','workshop','competition'].includes(cat)) q.cat = cat;
  if(search) q.$text = { $search: String(search) };
  if(today === 'true'){
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
    q.when = { $gte: start, $lt: end };
  }
  const skip = Math.max(0, (parseInt(page)||1)-1) * Math.max(1, Math.min(100, parseInt(limit)||50));
  const lim = Math.max(1, Math.min(100, parseInt(limit)||50));

  const items = await Notification.find(q).sort({ when: 1, createdAt: -1 }).skip(skip).limit(lim).lean();
  res.json(items);
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const n = new Notification({
    title: cleanStr(req.body.title, 200),
    when: req.body.when ? new Date(req.body.when) : null,
    cat: req.body.cat,
    venue: cleanStr(req.body.venue, 120),
    status: 'open'
  });
  await n.save();
  res.json({ ok:true, id: n._id });
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const { id } = req.params;
  await Notification.findByIdAndDelete(id);
  res.json({ ok:true });
});

export default router;
