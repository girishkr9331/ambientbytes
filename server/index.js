require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',  require('./routes/auth'));
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🌧️  DevBlog server running at http://localhost:${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api/posts`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth/login\n`);
});
