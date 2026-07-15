import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Lock } from 'lucide-react';

function readingTime(text = '') {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const ACCENT_COLORS = [
  '#58A6FF', '#7D9AAA', '#79C0FF', '#A5D6FF',
  '#56D364', '#F2CC60', '#FF7B72', '#D2A8FF',
];

export default function PostCard({ post }) {
  const navigate = useNavigate();

  let tags = [];
  try { tags = JSON.parse(post.tags || '[]'); } catch {}

  const accentColor = post.cover_color || ACCENT_COLORS[post.id % ACCENT_COLORS.length];
  const rt = readingTime(post.excerpt);

  return (
    <article
      className="post-card"
      style={{ '--card-accent': accentColor }}
      onClick={() => navigate(`/post/${post.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/post/${post.slug}`)}
      aria-label={`Read post: ${post.title}`}
    >
      <div className="post-card-meta">
        <span className="post-date">
          <Calendar size={12} />
          {formatDate(post.created_at)}
        </span>
        <span className="post-reading-time">
          <Clock size={12} />
          {rt} min read
        </span>
        {!post.published && (
          <span className="private-badge">
            <Lock size={10} /> Private
          </span>
        )}
      </div>

      <h2 className="post-card-title">{post.title}</h2>

      {post.excerpt && (
        <p className="post-card-excerpt">{post.excerpt}</p>
      )}

      {tags.length > 0 && (
        <div className="post-card-tags">
          {tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag-badge">{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}
