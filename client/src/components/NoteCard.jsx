import React from 'react';
import { FileText, Star, Edit3, Trash2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function NoteCard({ item, viewMode, onEdit, onDelete, onToggleFavorite, onView, onSelectTag }) {
  if (viewMode === 'list') {
    return (
      <div className="card-list" onClick={() => onView(item)} style={{ cursor: 'pointer' }}>
        <div className="card-list-icon">
          <FileText className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="card-list-body">
          <div className="card-list-title">
            <span>{item.title}</span>
            <span style={{ fontSize: '10px', marginLeft: '6px', fontFamily: 'monospace', color: 'var(--text-xmuted)', background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: '3px' }}>
              NOTE
            </span>
          </div>
          <div className="card-list-sub">
            {(item.content || '').replace(/[#*`_>]/g, '').slice(0, 80)}...
          </div>
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
    );
  }

  return (
    <div className="card" onClick={() => onView(item)} style={{ cursor: 'pointer' }}>
      <div className="card-body" style={{ paddingBottom: '6px' }}>
        <div className="card-meta">
          <span className="card-type-badge">MARKDOWN</span>
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
      </div>

      <div className="note-preview">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {item.content || '*Empty note*'}
        </ReactMarkdown>
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
