import React, { useState } from 'react';
import { Globe, Star, Edit3, Trash2, Copy, Check, ExternalLink } from 'lucide-react';

export function BookmarkCard({ item, viewMode, onEdit, onDelete, onToggleFavorite, onSelectTag }) {
  const [copied, setCopied] = useState(false);
  const [ogError, setOgError] = useState(false);
  const [favError, setFavError] = useState(false);

  const getDomain = (url) => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    } catch {
      return 'web';
    }
  };

  const domain = item.url ? getDomain(item.url) : 'web';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!item.url) return;
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (viewMode === 'list') {
    return (
      <div className="card-list">
        <div className="card-list-icon">
          {item.favicon && !favError ? (
            <img src={item.favicon} alt="" onError={() => setFavError(true)} />
          ) : (
            <Globe className="w-4 h-4 text-neutral-400" />
          )}
        </div>
        <div className="card-list-body">
          <div className="card-list-title">
            <a href={item.url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
              <span>{item.title}</span>
              <ExternalLink className="w-3 h-3 opacity-60 inline" />
            </a>
            <span style={{ fontSize: '10px', marginLeft: '6px', fontFamily: 'monospace', color: 'var(--text-xmuted)', background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: '3px' }}>
              {domain}
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
        <div className="card-actions">
          <button
            type="button"
            className="action-btn"
            title={copied ? 'Copied' : 'Copy link'}
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
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
    <div className="card">
      {item.ogImage && !ogError && (
        <img
          className="card-og"
          src={item.ogImage}
          alt=""
          onError={() => setOgError(true)}
        />
      )}
      <div className="card-body">
        <div className="card-meta">
          {item.favicon && !favError ? (
            <img
              className="card-favicon"
              src={item.favicon}
              alt=""
              onError={() => setFavError(true)}
            />
          ) : (
            <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', color: 'var(--text-xmuted)' }}>
              <Globe className="w-3.5 h-3.5" />
            </span>
          )}
          <span className="card-domain">{domain}</span>
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
        <div className="card-title">
          <a href={item.url || '#'} target="_blank" rel="noreferrer">
            {item.title}
          </a>
        </div>
        {item.description && <div className="card-desc">{item.description}</div>}
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
          className="action-btn copy-link-btn"
          title={copied ? 'Copied' : 'Copy link'}
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
