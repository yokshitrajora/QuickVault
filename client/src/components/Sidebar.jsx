import React from 'react';
import { LayoutGrid, Bookmark, Code2, FileText, Star, Tag, Sparkles } from 'lucide-react';

export function Sidebar({
  currentFilter,
  onFilterChange,
  selectedTag,
  onSelectTag,
  itemCounts,
  tags,
  onSeed,
  isSeeding,
  isOpen,
  onCloseMobile,
}) {
  const navItems = [
    { type: 'ALL', label: 'All Items', icon: LayoutGrid, count: itemCounts.ALL },
    { type: 'BOOKMARK', label: 'Bookmarks', icon: Bookmark, count: itemCounts.BOOKMARK },
    { type: 'SNIPPET', label: 'Snippets', icon: Code2, count: itemCounts.SNIPPET },
    { type: 'NOTE', label: 'Notes', icon: FileText, count: itemCounts.NOTE },
    { type: 'FAVORITES', label: 'Favorites', icon: Star, count: itemCounts.FAVORITES },
  ];

  return (
    <aside id="sidebar" className={isOpen ? 'open' : ''}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">Q</div>
        <span>QuickVault</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentFilter === item.type && !selectedTag;
          return (
            <button
              key={item.type}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onFilterChange(item.type);
                onSelectTag(null);
                onCloseMobile();
              }}
            >
              <span className="nav-item-left">
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </span>
              {item.count > 0 && <span className="nav-count">{item.count}</span>}
            </button>
          );
        })}
      </nav>

      {/* Tags Section */}
      <div className="sidebar-section-label">
        <Tag className="w-3 h-3" />
        <span>Tags</span>
      </div>
      <div className="tag-cloud">
        {tags.length === 0 ? (
          <span style={{ fontSize: '11px', color: 'var(--text-xmuted)', padding: '0 4px' }}>
            No tags yet
          </span>
        ) : (
          tags.map((t) => (
            <button
              key={t.id || t.name}
              type="button"
              className={`tag-chip ${selectedTag === t.name ? 'active' : ''}`}
              onClick={() => {
                onSelectTag(selectedTag === t.name ? null : t.name);
                onCloseMobile();
              }}
            >
              <span>#{t.name}</span>
              <span className="tag-chip-count">{t.count}</span>
            </button>
          ))
        )}
      </div>

      {/* Load Sample Data button */}
      <div style={{ padding: '0 8px', marginTop: '8px' }}>
        <button
          type="button"
          className="seed-btn"
          onClick={onSeed}
          disabled={isSeeding}
        >
          <Sparkles className="w-3 h-3" />
          <span>{isSeeding ? 'Loading...' : 'Load Sample Data'}</span>
        </button>
      </div>

      {/* User profile footer */}
      <div className="sidebar-footer">
        <img
          className="user-avatar"
          src="https://api.dicebear.com/8.x/initials/svg?seed=Demo%20User"
          alt="Avatar"
        />
        <div className="user-info">
          <div className="user-name">Demo User</div>
          <div className="user-email">demo@quickvault.dev</div>
        </div>
      </div>
    </aside>
  );
}
