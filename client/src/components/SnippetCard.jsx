import React, { useState } from 'react';
import { Code2, Star, Edit3, Trash2, Copy, Check, Maximize2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function SnippetCard({ item, viewMode, onEdit, onDelete, onToggleFavorite, onView, onSelectTag }) {
  const [copied, setCopied] = useState(false);
  const lang = (item.language || 'javascript').toLowerCase();
  const code = item.content || '// empty snippet';

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (viewMode === 'list') {
    return (
      <div className="card-list" onClick={() => onView(item)} style={{ cursor: 'pointer' }}>
        <div className="card-list-icon">
          <Code2 className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="card-list-body">
          <div className="card-list-title">
            <span>{item.title}</span>
            <span style={{ fontSize: '10px', marginLeft: '6px', fontFamily: 'monospace', color: 'var(--text-xmuted)', background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: '3px' }}>
              {lang}
            </span>
          </div>
          {item.description && <div className="card-list-sub">{item.description}</div>}
          {item.tags?.length > 0 && (
            <div className="card-list-tags">
              {item.tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="card-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag(t);
                  }}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="card-list-right">
          <button type="button" className="copy-btn" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <div className="card-actions">
            <button
              type="button"
              className={`action-btn fav ${item.isFavorite ? 'on' : ''}`}
              title="Favorite"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item);
              }}
            >
              <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              className="action-btn"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="action-btn danger"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" onClick={() => onView(item)} style={{ cursor: 'pointer' }}>
      <div className="card-body" style={{ paddingBottom: '6px' }}>
        <div className="card-meta">
          <span className="snippet-lang">{lang}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }} className="card-actions">
            <button
              type="button"
              className={`action-btn fav ${item.isFavorite ? 'on' : ''}`}
              title="Favorite"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item);
              }}
            >
              <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              className="action-btn"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="action-btn danger"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="card-title" style={{ marginTop: '6px' }}>{item.title}</div>
        {item.description && <div className="card-desc">{item.description}</div>}
      </div>

      <div className="code-preview">
        <div className="code-preview-toolbar">
          <span>{lang}</span>
          <button type="button" className="copy-btn" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre>
          <SyntaxHighlighter
            language={lang}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '8px 12px',
              fontSize: '11px',
              lineHeight: '1.45',
              background: 'transparent',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </pre>
      </div>

      <div className="card-footer">
        <div className="card-tags">
          {item.tags?.length > 0 ? (
            item.tags.map((t) => (
              <button
                key={t}
                type="button"
                className="card-tag"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag(t);
                }}
              >
                #{t}
              </button>
            ))
          ) : (
            <span style={{ fontSize: '10px', color: 'var(--text-xmuted)', fontFamily: 'monospace' }}>no tags</span>
          )}
        </div>
        <button
          type="button"
          className="action-btn"
          title="Expand"
          onClick={(e) => {
            e.stopPropagation();
            onView(item);
          }}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
