import jwt from 'jsonwebtoken';

export function authRequired(req, res, next){
  const h = req.headers['authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if(!token) return res.status(401).json({ ok:false, error:'No token provided' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ ok:false, error:'Token expired' });
    } else if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ ok:false, error:'Invalid token' });
    }
    return res.status(401).json({ ok:false, error:'Authentication failed' });
  }
}

export function adminOnly(req, res, next){
  if(!req.user || req.user.role !== 'admin'){
    return res.status(403).json({ ok:false, error:'Admin access required' });
  }
  next();
}