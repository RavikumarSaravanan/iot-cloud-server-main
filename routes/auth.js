import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { required } from '../utils/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', authLimiter, async (req, res) => {
  try{
    const email = required(String(req.body.email||'').toLowerCase().trim(), 'email');
    const password = required(String(req.body.password||''), 'password');
    if(password.length < 8) return res.status(422).json({ ok:false, error:'Password too short' });
    const exists = await User.findOne({ email });
    if(exists) return res.status(409).json({ ok:false, error:'User exists' });
    const u = new User({ email, role: 'user' });
    await u.setPassword(password);
    await u.save();
    return res.json({ ok:true });
  }catch(e){
    console.error(e);
    res.status(e.status||500).json({ ok:false, error: e.message || 'Failed' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try{
    const email = required(String(req.body.email||'').toLowerCase().trim(), 'email');
    const password = required(String(req.body.password||''), 'password');
    const u = await User.findOne({ email });
    if(!u) return res.status(401).json({ ok:false, error:'Invalid credentials' });
    const ok = await u.validatePassword(password);
    if(!ok) return res.status(401).json({ ok:false, error:'Invalid credentials' });
    const token = jwt.sign({ id: u._id.toString(), email: u.email, role: u.role }, process.env.JWT_SECRET, { expiresIn:'8h' });
    return res.json({ token, user: { id: u._id, email: u.email, role: u.role } });
  }catch(e){
    console.error(e);
    res.status(500).json({ ok:false, error:'Login failed' });
  }
});

router.get('/me', async (req, res) => {
  try{
    const h = req.headers['authorization'] || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if(!token) return res.status(401).end();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json(payload);
  }catch(e){
    res.status(401).end();
  }
});

router.post('/logout', (req, res)=>{
  // Stateless JWT: client deletes the token.
  res.json({ ok:true });
});

export default router;
