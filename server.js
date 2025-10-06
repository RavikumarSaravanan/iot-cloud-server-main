import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.js';
import notifRoutes from './routes/notifications.js';
import projectRoutes from './routes/projects.js';
import publicRoutes from './routes/public.js';
import tutorialRoutes from './routes/tutorial.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Security & Core ---
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // can be customized
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'changeme'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d', immutable: true }));

// --- CORS ---
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, credentials: false }));
// --- API routes with rate limit ---
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api', publicRoutes);

// Specific routes for SPA pages (BEFORE static middleware)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- Serve static frontend ---
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Bootstrap admin if not exists ---
async function ensureAdmin(){
  const { User } = await import('./models/User.js');
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const pass = process.env.ADMIN_PASSWORD;
  if(!email || !pass) return;
  const exists = await User.findOne({ email });
  if(!exists){
    const u = new User({ email, role: 'admin' });
    await u.setPassword(pass);
    await u.save();
    console.log('[bootstrap] Admin user created:', email);
  }
}

// --- Start servers ---
const PORT = parseInt(process.env.PORT || '3000', 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '3443', 10);

const certDir = path.join(__dirname, 'certs');
const keyPath = path.join(certDir, 'selfsigned.key');
const crtPath = path.join(certDir, 'selfsigned.crt');
let httpsOptions = null;
if (fs.existsSync(keyPath) && fs.existsSync(crtPath)){
  httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(crtPath)
  };
}

(async () => {
  try{
    const conn = await connectDB(process.env.MONGODB_URI);
    console.log('[db] connected:', conn.name);

    await ensureAdmin();

    if(httpsOptions){
      https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
        console.log('[https] listening on', HTTPS_PORT);
      });
      // Optional: redirect HTTP -> HTTPS
      http.createServer((req, res)=>{
        const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
        res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
        res.end();
      }).listen(PORT, () => console.log('[http] redirect server on', PORT));
    }else{
      app.listen(PORT, () => console.log('[http] listening on', PORT));
    }
  }catch(e){
    console.error('Server startup failed:', e);
    process.exit(1);
  }
})();
