const express      = require('express');
const router       = express.Router();
const db           = require('../db');
const { requireAuth } = require('../auth');

// Helper: generate slug from title
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now();
}

// Helper: generate excerpt from markdown content
function makeExcerpt(content, max = 160) {
  const stripped = content.replace(/[#*`>[\]]/g, '').replace(/\n+/g, ' ').trim();
  return stripped.length > max ? stripped.slice(0, max) + '…' : stripped;
}

// ── GET /api/posts — public: published posts only ──────────────────────────
router.get('/', (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = 'SELECT id, title, slug, excerpt, tags, cover_color, published, created_at, updated_at FROM posts WHERE published = 1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR excerpt LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    let posts = db.prepare(query).all(...params);

    if (tag) {
      posts = posts.filter(p => {
        try {
          const tags = JSON.parse(p.tags || '[]');
          return tags.includes(tag);
        } catch {
          return false;
        }
      });
    }

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ── GET /api/posts/all — protected: all posts including private ────────────
router.get('/all', requireAuth, (req, res) => {
  try {
    const posts = db.prepare(
      'SELECT id, title, slug, content, excerpt, tags, cover_color, published, created_at, updated_at FROM posts ORDER BY created_at DESC'
    ).all();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// ── GET /api/posts/:slug — single post by slug ─────────────────────────────
// Private posts (published=0) require auth
router.get('/:slug', (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.published) {
      // Require valid token for private posts
      const header = req.headers['authorization'];
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'This post is private' });
      }
      try {
        const jwt = require('jsonwebtoken');
        jwt.verify(header.slice(7), process.env.JWT_SECRET);
      } catch {
        return res.status(403).json({ error: 'This post is private' });
      }
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ── POST /api/posts — create post (auth required) ─────────────────────────
router.post('/', requireAuth, (req, res) => {
  try {
    const { title, content, tags, cover_color, published } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

    const slug    = slugify(title);
    const excerpt = makeExcerpt(content || '');
    const tagsStr = JSON.stringify(Array.isArray(tags) ? tags : []);

    const result = db.prepare(
      `INSERT INTO posts (title, slug, content, excerpt, tags, cover_color, published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(title.trim(), slug, content || '', excerpt, tagsStr, cover_color || '#58A6FF', published ? 1 : 0);

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ── PUT /api/posts/:id — update post (auth required) ──────────────────────
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { title, content, tags, cover_color, published } = req.body;
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const excerpt = makeExcerpt(content || '');
    const tagsStr = JSON.stringify(Array.isArray(tags) ? tags : []);

    db.prepare(
      `UPDATE posts SET title = ?, content = ?, excerpt = ?, tags = ?, cover_color = ?, published = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      title || post.title,
      content ?? post.content,
      excerpt,
      tagsStr,
      cover_color || post.cover_color,
      published !== undefined ? (published ? 1 : 0) : post.published,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// ── DELETE /api/posts/:id — delete post (auth required) ───────────────────
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
