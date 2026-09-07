import React, { useState } from 'react';
import { X, Calendar, Tag, Edit3, Copy, Check, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function ItemDetailModal({ item, isOpen, onClose, onEdit, onSelectTag }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const lang = (item.language || 'javascript').toLowerCase();
  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopyCode = () => {
    if (!item.content) return;
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {item.type === 'SNIPPET' ? lang : item.type}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-xmuted)' }}>
                <Calendar className="w-3 h-3" />
                {date}
              </span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
              {item.title}
            </div>
            {item.description && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {item.description}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button
              type="button"
              className="btn-icon"
              title="Edit"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button type="button" className="btn-icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ gap: '14px' }}>
          {/* Bookmark view */}
          {item.type === 'BOOKMARK' && (
            <>
              {item.ogImage && (
                <img src={item.ogImage} alt="" className="detail-og" />
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="detail-url">
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.url}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </>
          )}

          {/* Snippet view */}
          {item.type === 'SNIPPET' && (
            <div className="detail-code">
              <div className="detail-code-toolbar">
                <span>{lang}</span>
                <button type="button" className="copy-btn" onClick={handleCopyCode}>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre style={{ margin: 0, padding: 0 }}>
                <SyntaxHighlighter
                  language={lang}
                  style={oneDark}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: '14px 16px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    background: 'transparent',
                  }}
                >
                  {item.content || '// Empty'}
                </SyntaxHighlighter>
              </pre>
            </div>
          )}

          {/* Note view */}
          {item.type === 'NOTE' && (
            <div className="detail-note">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.content || '*Empty note*'}
              </ReactMarkdown>
            </div>
          )}

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div>
              <div className="detail-tag-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag className="w-3 h-3" /> Tags
              </div>
              <div className="detail-tags">
                {item.tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="card-tag"
                    onClick={() => {
                      onClose();
                      onSelectTag(t);
                    }}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
