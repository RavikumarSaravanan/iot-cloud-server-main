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
// Local imports
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import notifRoutes from './routes/notifications.js';
import projectRoutes from './routes/projects.js';
import tutorialRoutes from './routes/tutorial.js';
import publicRoutes from './routes/public.js';
// New routes
import userRoutes from './routes/users.js';
import learningPathRoutes from './routes/learningPaths.js';
import forumRoutes from './routes/forum.js';


// Environment setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ------------ BASIC SECURITY AND UTILITY ------------
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'changeme'));

// ------------ CORS CONFIGURATION ------------
const allowed = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowed.length === 0) return callback(null, true);
    if (allowed.includes(origin) || /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    console.warn('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ------------ STATIC FILE SERVING (PUBLIC HTMLs) ------------
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, { maxAge: '7d', immutable: true }));

// Serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));

// Example:  
// /public/index.html  -> http://localhost:3000/
// /public/admin.html  -> http://localhost:3000/admin.html
// /public/contact.html -> http://localhost:3000/contact.html

// ------------ API ROUTES ------------
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/paths', learningPathRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api', publicRoutes);
console.log('[routes] Tutorial routes loaded'); 
// ------------ ADMIN BOOTSTRAP ------------
async function ensureAdmin() {
  const { User } = await import('./models/User.js');
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const pass = process.env.ADMIN_PASSWORD;
  if (!email || !pass) return;
  try {
    const exists = await User.findOne({ email });
    if (!exists) {
      const u = new User({ email, role: 'admin' });
      await u.setPassword(pass);
      await u.save();
      console.log('[bootstrap] Admin user created:', email);
    }
  } catch (err) {
    console.error('Error ensuring admin:', err);
  }
}

// ------------ FALLBACK FOR SPAs OR HTML PAGES ------------
app.get('*', (req, res) => {
  const target = path.join(publicDir, 'index.html');
  if (fs.existsSync(target)) {
    res.sendFile(target);
  } else {
    res.status(404).send('Page not found');
  }
});

// ------------ SERVER INIT ------------
const PORT = parseInt(process.env.PORT || '3000', 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '3443', 10);
const certDir = path.join(__dirname, 'certs');
const keyPath = path.join(certDir, 'selfsigned.key');
const crtPath = path.join(certDir, 'selfsigned.crt');

let httpsOptions = null;
if (fs.existsSync(keyPath) && fs.existsSync(crtPath)) {
  httpsOptions = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(crtPath) };
}

(async () => {
  try {
    const conn = await connectDB(process.env.MONGODB_URI);
    console.log('[db] connected:', conn.name);
    await ensureAdmin();

    if (httpsOptions) {
      https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
        console.log('[https] listening on', HTTPS_PORT);
      });
      http.createServer((req, res) => {
        const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
        res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
        res.end();
      }).listen(PORT, () => console.log('[http] redirect server on', PORT));
    } else {
      app.listen(PORT, () => console.log('[http] listening on', PORT));
    }
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
})();