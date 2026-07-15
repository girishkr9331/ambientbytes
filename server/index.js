require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure a JWT secret is always available to prevent startup failures.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_123';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret_123') {
  console.warn('⚠️ JWT_SECRET is not configured. Using a development fallback secret. Set JWT_SECRET in Render environment for production.');
}

const clientOrigin = process.env.CLIENT_ORIGIN || true;
const distPath = path.join(__dirname, '..', 'client', 'dist');

// Middleware
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// Serve static media (music + background video) with streaming support
app.use('/music', express.static(path.join(__dirname, 'music'), {
  setHeaders: (res) => {
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));
app.use('/backgrounds', express.static(path.join(__dirname, 'backgrounds'), {
  setHeaders: (res) => {
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve built client app when available
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: '1d' }));
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🌧️  DevBlog server running at http://localhost:${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api/posts`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth/login\n`);
});
