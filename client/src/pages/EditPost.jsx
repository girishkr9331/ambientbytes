import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PostEditor from '../components/PostEditor';
import Toast from '../components/Toast';
import api from '../api';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  useEffect(() => {
    // Fetch by id — find from all posts (author only)
    api.get('/posts/all')
      .then(r => {
        const found = r.data.find(p => String(p.id) === String(id));
        if (!found) navigate('/', { replace: true });
        else setPost(found);
      })
      .catch(() => navigate('/', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = useCallback(({ type, msg, post: saved }) => {
    setToast({ msg, type });
    if (type === 'success' && saved) {
      setTimeout(() => navigate(`/post/${saved.slug}`), 1200);
    }
  }, [navigate]);

  if (loading) {
    return (
      <main className="page-content">
        <div className="loading-wrap"><div className="spinner" /></div>
      </main>
    );
  }

  return (
    <main className="page-content editor-page-content" id="main-content">
      <Link to="/" className="back-link" aria-label="Back to all posts">
        <ArrowLeft size={14} /> All posts
      </Link>

      <div className="page-header">
        <h1 className="page-title">Edit Post</h1>
        <p className="page-subtitle">Refine your thoughts…</p>
      </div>

      {post && (
        <PostEditor
          initialData={post}
          postId={post.id}
          onSave={handleSave}
        />
      )}

      <Toast
        message={toast.msg}
        type={toast.type}
        onHide={() => setToast({ msg: '', type: toast.type })}
      />
    </main>
  );
}
