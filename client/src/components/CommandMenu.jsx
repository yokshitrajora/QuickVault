import React, { useState, useEffect, useRef } from 'react';
import { Search, Bookmark, Code2, FileText, Sun, Moon, ArrowRight } from 'lucide-react';

export function CommandMenu({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onOpenAddModal,
  theme,
  onToggleTheme,
}) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const filtered = q
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.url?.toLowerCase().includes(q) ||
          i.content?.toLowerCase().includes(q) ||
          i.tags?.some((t) => t.toLowerCase().includes(q))
      ).slice(0, 8)
    : items.slice(0, 8);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      onSelectItem(filtered[selectedIdx]);
      onClose();
    }
  };

  return (
    <div id="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        {/* Search input header */}
        <div className="cmd-input-wrap">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Search or run a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
          />
          <kbd className="cmd-esc">ESC</kbd>
        </div>

        {/* Quick actions when query is empty */}
        {!query && (
          <div className="cmd-quick">
            <div className="cmd-section-label">Quick Actions</div>
            <div className="cmd-quick-grid">
              <button
                type="button"
                className="cmd-quick-action"
                onClick={() => {
                  onClose();
                  onOpenAddModal('BOOKMARK');
                }}
              >
                <Bookmark className="w-3 h-3 text-neutral-400" />
                <span>Bookmark</span>
              </button>
              <button
                type="button"
                className="cmd-quick-action"
                onClick={() => {
                  onClose();
                  onOpenAddModal('SNIPPET');
                }}
              >
                <Code2 className="w-3 h-3 text-neutral-400" />
                <span>Snippet</span>
              </button>
              <button
                type="button"
                className="cmd-quick-action"
                onClick={() => {
                  onClose();
                  onOpenAddModal('NOTE');
                }}
              >
                <FileText className="w-3 h-3 text-neutral-400" />
                <span>Note</span>
              </button>
              <button
                type="button"
                className="cmd-quick-action"
                onClick={() => {
                  onToggleTheme();
                  onClose();
                }}
              >
                {theme === 'dark' ? <Sun className="w-3 h-3 text-neutral-400" /> : <Moon className="w-3 h-3 text-neutral-400" />}
                <span>Theme</span>
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="cmd-results">
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              No results found
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                className={`cmd-result ${idx === selectedIdx ? 'selected' : ''}`}
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={() => {
                  onClose();
                  onSelectItem(item);
                }}
              >
                <div className="cmd-result-icon">
                  {item.type === 'BOOKMARK' && <Bookmark className="w-3.5 h-3.5 text-neutral-400" />}
                  {item.type === 'SNIPPET' && <Code2 className="w-3.5 h-3.5 text-neutral-400" />}
                  {item.type === 'NOTE' && <FileText className="w-3.5 h-3.5 text-neutral-400" />}
                </div>
                <div className="cmd-result-body">
                  <div className="cmd-result-title">{item.title}</div>
                  <div className="cmd-result-sub">
                    {item.description || item.url || (item.content || '').slice(0, 50)}
                  </div>
                </div>
                {item.tags?.[0] && <span className="cmd-result-tag">#{item.tags[0]}</span>}
                <ArrowRight className="w-3 h-3 text-neutral-400 opacity-60" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cmd-footer">
          <span>↑ ↓ navigate · ↵ open</span>
          <span>QuickVault</span>
        </div>
      </div>
    </div>
  );
}
