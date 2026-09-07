import React, { useState } from 'react';
import { X, Bookmark, Code2, FileText, Sparkles, Star, Tag, PenTool, Eye, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../api/client';

const LANGUAGES = [
  'typescript', 'javascript', 'python', 'rust', 'go', 'sql',
  'html', 'css', 'json', 'bash', 'csharp', 'cpp', 'java', 'yaml', 'markdown'
];

export function AddItemModal({ isOpen, onClose, initialType = 'BOOKMARK', onSaved }) {
  const [activeType, setActiveType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Scraper state
  const [isScraping, setIsScraping] = useState(false);
  const [ogImage, setOgImage] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [scrapeError, setScrapeError] = useState(null);

  // Markdown sub-tab
  const [mdTab, setMdTab] = useState('write');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFetchMetadata = async () => {
    if (!url.trim()) return;
    setIsScraping(true);
    setScrapeError(null);
    try {
      const data = await api.scrapeMetadata(url.trim());
      if (data.title && !title) setTitle(data.title);
      if (data.description && !description) setDescription(data.description);
      if (data.ogImage) setOgImage(data.ogImage);
      if (data.favicon) setFavicon(data.favicon);
    } catch {
      setScrapeError('Could not auto-scrape. Please enter details manually.');
    } finally {
      setIsScraping(false);
    }
  };

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
      await api.createItem({
        type: activeType,
        title: title.trim(),
        description: description.trim() || undefined,
        url: activeType === 'BOOKMARK' ? url.trim() || undefined : undefined,
        content: activeType !== 'BOOKMARK' ? content : undefined,
        language: activeType === 'SNIPPET' ? language : undefined,
        ogImage: ogImage || undefined,
        favicon: favicon || undefined,
        tags,
        isFavorite,
      });
      resetForm();
      onClose();
      onSaved();
    } catch (err) {
      alert(err.message || 'Failed to create item');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setContent('');
    setLanguage('typescript');
    setOgImage(null);
    setFavicon(null);
    setIsFavorite(false);
    setTags([]);
    setTagInput('');
    setScrapeError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Type Selector */}
        <div className="modal-header">
          <div className="type-tabs">
            <button
              type="button"
              className={`type-tab ${activeType === 'BOOKMARK' ? 'active' : ''}`}
              onClick={() => setActiveType('BOOKMARK')}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmark</span>
            </button>
            <button
              type="button"
              className={`type-tab ${activeType === 'SNIPPET' ? 'active' : ''}`}
              onClick={() => setActiveType('SNIPPET')}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Snippet</span>
            </button>
            <button
              type="button"
              className={`type-tab ${activeType === 'NOTE' ? 'active' : ''}`}
              onClick={() => setActiveType('NOTE')}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {/* BOOKMARK specific fields */}
            {activeType === 'BOOKMARK' && (
              <div className="form-group">
                <label className="form-label">URL</label>
                <div className="form-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onBlur={() => {
                      if (url && !title) handleFetchMetadata();
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="scrape-btn"
                    onClick={handleFetchMetadata}
                    disabled={isScraping || !url}
                  >
                    {isScraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isScraping ? 'Scraping...' : 'Scrape'}</span>
                  </button>
                </div>
                {scrapeError && <span style={{ fontSize: '11px', color: 'var(--text-xmuted)' }}>{scrapeError}</span>}

                {/* Scrape preview badge */}
                {(ogImage || favicon) && (
                  <div className="scrape-preview">
                    {ogImage && <img src={ogImage} alt="" className="scrape-thumb" />}
                    <div className="scrape-info">
                      <div className="scrape-title">{title || 'Metadata extracted'}</div>
                      <div className="scrape-desc">{description || url}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="Item title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* SNIPPET specific fields */}
            {activeType === 'SNIPPET' && (
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
                    placeholder="// Paste code here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* NOTE specific fields */}
            {activeType === 'NOTE' && (
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <label className="form-label">Content</label>
                  <div className="md-tabs">
                    <button
                      type="button"
                      className={`md-tab ${mdTab === 'write' ? 'active' : ''}`}
                      onClick={() => setMdTab('write')}
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Write</span>
                    </button>
                    <button
                      type="button"
                      className={`md-tab ${mdTab === 'preview' ? 'active' : ''}`}
                      onClick={() => setMdTab('preview')}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {mdTab === 'write' ? (
                  <textarea
                    rows={8}
                    className="form-textarea"
                    placeholder="# Heading&#10;&#10;Write markdown notes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                ) : (
                  <div className="md-preview">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || '*No content yet*'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* Description for bookmarks and snippets */}
            {activeType !== 'NOTE' && (
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Optional summary or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            )}

            {/* Tags input */}
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
                  placeholder={tags.length === 0 ? 'add tags (Enter to add)...' : 'add tag...'}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDownTag}
                  onBlur={() => {
                    if (tagInput.trim()) addTag(tagInput);
                  }}
                />
              </div>
            </div>

            {/* Favorite toggle */}
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

          {/* Footer Actions */}
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
