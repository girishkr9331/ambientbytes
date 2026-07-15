import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, Clock, Lock, Link2, Globe } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function readingTime(text = '') {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function PostDetail() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [post,          setPost]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState({ msg: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get(`/posts/${slug}`)
      .then(r => setPost(r.data))
      .catch(() => navigate('/', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`);
      navigate('/', { replace: true });
    } catch {
      setToast({ msg: 'Failed to delete post.', type: 'error' });
    }
  };

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => setToast({ msg: 'Link copied to clipboard!', type: 'success' }))
      .catch(() => setToast({ msg: 'Could not copy link.', type: 'error' }));
  }, []);

  let tags = [];
  try { tags = JSON.parse(post?.tags || '[]'); } catch {}

  if (loading) {
    return (
      <main className="page-content">
        <div className="loading-wrap"><div className="spinner" /></div>
      </main>
    );
  }

  if (!post) return null;

  const rt = readingTime(post.content);
  const isPrivate = !post.published;

  return (
    <main className="page-content" id="main-content">
      {/* Back */}
      <Link to="/" className="back-link" aria-label="Back to all posts">
        <ArrowLeft size={14} /> All posts
      </Link>

      {/* Header */}
      <header className="post-detail-header">
        <div className="post-detail-meta">
          <span className="post-date"><Calendar size={13} /> {formatDate(post.created_at)}</span>
          <span className="post-reading-time"><Clock size={13} /> {rt} min read</span>

          {/* Visibility badge */}
          {isPrivate ? (
            <span className="private-badge">
              <Lock size={10} /> Private
            </span>
          ) : (
            <span className="public-badge">
              <Globe size={10} /> Public
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="post-card-tags" style={{ marginBottom: 12 }}>
            {tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}
          </div>
        )}

        <h1 className="post-detail-title">{post.title}</h1>

        {/* Actions */}
        <div className="post-detail-actions">
          {/* Share / Copy link — only for public posts, visible to everyone */}
          {!isPrivate && (
            <button
              className="btn btn-ghost share-btn"
              onClick={handleCopyLink}
              aria-label="Copy link to this post"
            >
              <Link2 size={14} /> Copy link
            </button>
          )}

          {/* Edit & Delete — only for the logged-in author */}
          {user && (
            <>
              <button
                className="btn btn-ghost"
                onClick={() => navigate(`/edit/${post.id}`)}
                aria-label="Edit this post"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete this post"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <MarkdownRenderer content={post.content} />

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <div className="dialog-box">
            <h3 id="dialog-title">Delete this post?</h3>
            <p>This action cannot be undone. The post will be permanently removed.</p>
            <div className="dialog-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.msg}
        type={toast.type}
        onHide={() => setToast({ msg: '', type: toast.type })}
      />
    </main>
  );
}
