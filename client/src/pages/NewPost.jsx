import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PostEditor from '../components/PostEditor';
import Toast from '../components/Toast';

export default function NewPost() {
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const navigate = useNavigate();

  const handleSave = useCallback(({ type, msg }) => {
    setToast({ msg, type });
  }, []);

  return (
    <main className="page-content editor-page-content" id="main-content">
      <Link to="/" className="back-link" aria-label="Back to all posts">
        <ArrowLeft size={14} /> All posts
      </Link>

      <div className="page-header">
        <h1 className="page-title">New Post</h1>
        <p className="page-subtitle">Write something in the rain…</p>
      </div>

      <PostEditor onSave={handleSave} />

      <Toast
        message={toast.msg}
        type={toast.type}
        onHide={() => setToast({ msg: '', type: toast.type })}
      />
    </main>
  );
}
