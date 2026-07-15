import { useState, useEffect, useRef, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ACCENT_COLORS = [
  '#58A6FF', '#7D9AAA', '#79C0FF', '#A5D6FF',
  '#56D364', '#F2CC60', '#FF7B72', '#D2A8FF',
];

export default function PostEditor({ initialData, postId, onSave }) {
  const navigate = useNavigate();
  const tagInputRef = useRef(null);

  const [title, setTitle]       = useState(initialData?.title || '');
  const [content, setContent]   = useState(initialData?.content || '');
  const [tags, setTags]         = useState(() => {
    try { return JSON.parse(initialData?.tags || '[]'); } catch { return []; }
  });
  const [tagInput, setTagInput] = useState('');
  const [color, setColor]       = useState(initialData?.cover_color || '#58A6FF');
  const [published, setPublished] = useState(initialData?.published !== 0);
  const [saving, setSaving]     = useState(false);

  const addTag = useCallback(() => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      onSave?.({ type: 'error', msg: 'Title is required.' });
      return;
    }
    setSaving(true);
    try {
      const payload = { title, content, tags, cover_color: color, published };
      let res;
      if (postId) {
        res = await api.put(`/posts/${postId}`, payload);
      } else {
        res = await api.post('/posts', payload);
      }
      onSave?.({ type: 'success', msg: postId ? 'Post updated!' : 'Post published!', post: res.data });
      if (!postId) navigate(`/post/${res.data.slug}`);
    } catch (err) {
      console.error(err);
      onSave?.({ type: 'error', msg: 'Failed to save post.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editor-form">
      {/* Title */}
      <div className="form-field">
        <label className="form-label" htmlFor="post-title">Title</label>
        <input
          id="post-title"
          className="form-input title-input"
          placeholder="Your post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={200}
        />
      </div>

      {/* Markdown Editor */}
      <div className="form-field">
        <label className="form-label">Content</label>
        <div className="editor-area">
          <MDEditor
            value={content}
            onChange={setContent}
            height={750}
            preview="live"
            visibleDragbar={false}
            data-color-mode="dark"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="form-field">
        <label className="form-label">Tags <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(press Enter or comma)</span></label>
        <div
          className="tags-input-wrap"
          onClick={() => tagInputRef.current?.focus()}
        >
          {tags.map(tag => (
            <span key={tag} className="tag-chip">
              {tag}
              <button
                className="tag-chip-remove"
                onClick={e => { e.stopPropagation(); removeTag(tag); }}
                aria-label={`Remove tag ${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            ref={tagInputRef}
            className="tag-input-inline"
            placeholder={tags.length === 0 ? 'Add tags...' : ''}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={addTag}
            maxLength={30}
          />
        </div>
      </div>

      {/* Accent Color */}
      <div className="form-field">
        <label className="form-label">Card accent color</label>
        <div className="color-picker-row">
          {ACCENT_COLORS.map(c => (
            <button
              key={c}
              className={`color-swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : postId ? 'Update Post' : 'Publish Post'}
        </button>

        <label className="publish-toggle" htmlFor="published-toggle">
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="published-toggle"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
            />
            <div className="toggle-track" />
          </div>
          {published ? 'Public' : 'Private'}
        </label>
      </div>
    </div>
  );
}
