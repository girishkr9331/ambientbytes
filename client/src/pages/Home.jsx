import { useState, useEffect, useMemo } from 'react';
import { Search, CloudRain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Home() {
  const { user } = useAuth();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    // Author sees all posts (including private); visitors see only public ones
    const endpoint = user ? '/posts/all' : '/posts';
    api.get(endpoint)
      .then(r => setPosts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach(p => {
      try { JSON.parse(p.tags || '[]').forEach(t => tagSet.add(t)); } catch {}
    });
    return [...tagSet];
  }, [posts]);

  // Filter posts by search & tag
  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt || '').toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || (() => {
        try { return JSON.parse(p.tags || '[]').includes(activeTag); } catch { return false; }
      })();
      return matchSearch && matchTag;
    });
  }, [posts, search, activeTag]);

  return (
    <main className="page-content" id="main-content">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <CloudRain size={22} style={{ display: 'inline', marginRight: 10, color: 'var(--accent)', verticalAlign: 'middle' }} />
          Thoughts
        </h1>
        <p className="page-subtitle">A personal space to write, think, and build.</p>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <div className="search-bar">
          <Search size={16} />
          <input
            id="search-posts"
            className="search-input"
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search blog posts"
          />
        </div>

        {allTags.length > 0 && (
          <div className="tags-filter" role="group" aria-label="Filter by tag">
            <button
              className={`tag-pill all-pill ${!activeTag ? 'active' : ''}`}
              onClick={() => setActiveTag('')}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-pill ${activeTag === tag ? 'active' : ''}`}
                onClick={() => setActiveTag(prev => prev === tag ? '' : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          <span>Loading posts…</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="posts-grid">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <CloudRain size={48} />
          <h3>{search || activeTag ? 'No posts match your search.' : 'No posts yet.'}</h3>
          <p>
            {search || activeTag
              ? 'Try a different search term or tag.'
              : 'The blog is quiet — write your first post.'}
          </p>
          {!search && !activeTag && user && (
            <Link to="/new">
              Write your first post <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
