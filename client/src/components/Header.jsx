import React from 'react';
import { Search, LayoutGrid, List, Sun, Moon, Plus, Menu } from 'lucide-react';

export function Header({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  theme,
  onToggleTheme,
  onOpenCommandMenu,
  onOpenAddModal,
  onToggleMobileSidebar,
}) {
  return (
    <header id="header">
      {/* Mobile hamburger menu */}
      <button
        type="button"
        className="btn-icon mobile-menu-btn"
        onClick={onToggleMobileSidebar}
        aria-label="Toggle Navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Global search trigger */}
      <div
        className="search-bar"
        onClick={onOpenCommandMenu}
      >
        <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <input
          type="text"
          className="search-bar-input"
          placeholder="Search items, tags, code..."
          value={searchQuery}
          onChange={(e) => {
            e.stopPropagation();
            onSearchChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
        />
        <kbd className="search-kbd">⌘K</kbd>
      </div>

      {/* Action controls */}
      <div className="header-actions">
        {/* View toggle (Grid / List) */}
        <div className="view-toggle">
          <button
            type="button"
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title="Grid view"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            title="List view"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          className="header-btn-icon"
          title="Toggle theme"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Add item button */}
        <button
          type="button"
          className="btn-primary"
          onClick={() => onOpenAddModal('BOOKMARK')}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Item</span>
        </button>
      </div>
    </header>
  );
}
