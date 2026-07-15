/**
 * Seed script — creates sample posts in the blog database.
 * Run once: node server/seed.js
 */
const db = require('./db');

const posts = [
  {
    title: 'Hello, Rain',
    content: `# Hello, Rain

It's a grey Thursday. The kind where the light never quite reaches through the clouds, and the rain just *refuses* to commit — not enough to be dramatic, just enough to make everything smell like wet concrete.

I built this blog today. Mostly as an excuse to write more, think less in Slack threads, and have somewhere that's just... mine.

## Why a blog in ${new Date().getFullYear()}?

Because I keep starting tweets, then deleting them. Because my Notion is a graveyard of half-thoughts. And because I've been meaning to write about the things I learn at work for months now.

Here's what you can expect:

- Technical deep-dives, but written like a human wrote them
- Notes from building side projects
- Occasional thoughts about the craft of programming
- Whatever else the rain brings

## The stack, since you'll ask

\`\`\`js
// React + Vite frontend
// Node.js + Express backend  
// SQLite for storage
// Markdown for writing
// Rain for ambiance
\`\`\`

More posts soon. The kettle's boiling.`,
    tags: JSON.stringify(['intro', 'meta', 'writing']),
    cover_color: '#58A6FF',
    published: 1,
    excerpt: "It's a grey Thursday. The kind where the light never quite reaches through the clouds. I built this blog today — mostly as an excuse to write more and have somewhere that's just mine.",
  },
  {
    title: 'Why I Keep Going Back to SQLite',
    content: `# Why I Keep Going Back to SQLite

Every time I start a personal project, I tell myself "maybe Postgres this time." And every time, around the second migration, I close the docker-compose file and reach for SQLite.

## It's just a file

That's it. That's the pitch. You get a \`.db\` file that you can:

- \`cp blog.db blog.db.bak\` — backup done
- \`scp blog.db server:/home/user/\` — migration done
- Open in [DB Browser for SQLite](https://sqlitebrowser.org/) and poke around visually

No connection pools. No auth. No port management. No "is the container healthy yet?"

## The numbers are fine for a personal blog

> SQLite can handle about 35% of real-world read workloads better than most server-based databases.
> — *the SQLite docs, paraphrased*

Unless you're Twitter, the throughput is not your problem.

## \`better-sqlite3\` makes it even nicer

\`\`\`js
const db = require('better-sqlite3')('blog.db');

// Synchronous — no await chains
const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);

// Transactions are trivial
const insertMany = db.transaction((posts) => {
  for (const post of posts) insert.run(post);
});
\`\`\`

Synchronous SQLite in Node feels wrong until it doesn't. Then it feels great.

## When to reach for something else

- Multi-server deployment with shared state → Postgres
- High write concurrency → Postgres  
- Your data is actually relational and complex → Postgres

For a personal blog? SQLite. Always.`,
    tags: JSON.stringify(['sqlite', 'databases', 'node.js']),
    cover_color: '#56D364',
    published: 1,
    excerpt: 'Every time I start a personal project, I tell myself "maybe Postgres this time." And every time, around the second migration, I close the docker-compose file and reach for SQLite.',
  },
  {
    title: 'The Quiet Power of Writing for Yourself',
    content: `# The Quiet Power of Writing for Yourself

The best programming blog posts I've ever read were written by people who didn't know if anyone was reading.

You can tell. There's a texture to them — a willingness to be uncertain, to say "I don't actually know why this works," to include the failed attempts alongside the solution.

## Public writing vs. personal writing

Most dev content is optimized for search engines or LinkedIn impressions. It front-loads the conclusion. It uses numbered lists. It resolves cleanly.

**Personal writing** is allowed to meander. It's allowed to not have a point yet. It can end with a question instead of an answer.

This blog is personal writing.

## The rubber duck effect

There's something that happens when you try to explain a thing in writing. You discover all the gaps in your understanding. The parts you were hand-waving become obvious.

\`\`\`
me, in my head: "yeah I understand how async/await works"
me, trying to explain it: "okay so... promises... and the event loop... actually hold on"
\`\`\`

Writing is a thinking tool, not just a communication tool.

## So write

Even if nobody reads it. Even if it's rough. Even if you're not sure it's worth saying.

The rain doesn't ask permission. Neither should your thoughts.`,
    tags: JSON.stringify(['writing', 'thoughts', 'craft']),
    cover_color: '#D2A8FF',
    published: 1,
    excerpt: "The best programming blog posts I've ever read were written by people who didn't know if anyone was reading. You can tell. There's a texture to them.",
  },
];

// Clear existing and insert
db.prepare('DELETE FROM posts').run();

const insert = db.prepare(`
  INSERT INTO posts (title, slug, content, excerpt, tags, cover_color, published)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

for (const p of posts) {
  insert.run(p.title, slugify(p.title), p.content, p.excerpt, p.tags, p.cover_color, p.published);
}

console.log(`✅ Seeded ${posts.length} posts into the database.`);
db.close();
