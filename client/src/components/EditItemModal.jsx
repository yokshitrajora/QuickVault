import React, { useState, useEffect } from 'react';
import { X, Star, Tag } from 'lucide-react';
import { api } from '../api/client';

const LANGUAGES = [
  'typescript', 'javascript', 'python', 'rust', 'go', 'sql',
  'html', 'css', 'json', 'bash', 'csharp', 'cpp', 'java', 'yaml', 'markdown'
];

export function EditItemModal({ item, isOpen, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setUrl(item.url || '');
      setDescription(item.description || '');
      setContent(item.content || '');
      setLanguage(item.language || 'typescript');
      setIsFavorite(item.isFavorite || false);
      setTags(item.tags || []);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const addTag = (text) => {
    const clean = text.trim().toLowerCase().replace(/^[#,]/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleKeyDownTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await api.updateItem(item.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        url: item.type === 'BOOKMARK' ? url.trim() || undefined : undefined,
        content: item.type !== 'BOOKMARK' ? content : undefined,
        language: item.type === 'SNIPPET' ? language : undefined,
        tags,
        isFavorite,
      });
      onClose();
      onSaved();
    } catch (err) {
      alert(err.message || 'Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              {item.type}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Edit Item</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {item.type === 'BOOKMARK' && (
              <div className="form-group">
                <label className="form-label">URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {item.type === 'SNIPPET' && (
              <>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Code</label>
                  <textarea
                    rows={8}
                    className="form-textarea code"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {item.type === 'NOTE' && (
              <div className="form-group">
                <label className="form-label">Markdown Content</label>
                <textarea
                  rows={8}
                  className="form-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
            )}

            {item.type !== 'NOTE' && (
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tags-input-wrap">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                {tags.map((t) => (
                  <span key={t} className="tag-input-chip">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tags-input"
                  placeholder="add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDownTag}
                  onBlur={() => {
                    if (tagInput.trim()) addTag(tagInput);
                  }}
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                className={`fav-toggle-btn ${isFavorite ? 'on' : ''}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'In Favorites' : 'Favorite'}</span>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isSaving || !title.trim()}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
