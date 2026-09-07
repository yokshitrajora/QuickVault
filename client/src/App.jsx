import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BookmarkCard } from './components/BookmarkCard';
import { SnippetCard } from './components/SnippetCard';
import { NoteCard } from './components/NoteCard';
import { AddItemModal } from './components/AddItemModal';
import { EditItemModal } from './components/EditItemModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CommandMenu } from './components/CommandMenu';
import { Plus, X, Inbox, Sparkles } from 'lucide-react';

const FILTER_TITLES = {
  ALL: 'All Items',
  BOOKMARK: 'Bookmarks',
  SNIPPET: 'Snippets',
  NOTE: 'Notes',
  FAVORITES: 'Favorites',
};

export function App() {
  // Navigation & Filter state
  const [filter, setFilter] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Data state
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState('BOOKMARK');
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync theme class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (filter !== 'ALL' && filter !== 'FAVORITES') params.type = filter;
      if (filter === 'FAVORITES') params.favorites = 'true';
      if (selectedTag) params.tag = selectedTag;

      const data = await api.getItems(params);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  }, [filter, selectedTag, searchQuery]);

  // Fetch all items (for global command search & counts) and tags
  const fetchMetadata = useCallback(async () => {
    try {
      const [all, tagList] = await Promise.all([api.getItems(), api.getTags()]);
      setAllItems(all);
      setTags(tagList);
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchItems(), fetchMetadata()]);
    setIsLoading(false);
  }, [fetchItems, fetchMetadata]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Global Keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDetailModalOpen(false);
        setIsCommandMenuOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenAddModal = (type = 'BOOKMARK') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleViewItem = (item) => {
    setViewingItem(item);
    setIsDetailModalOpen(true);
  };

  const handleToggleFavorite = async (item) => {
    try {
      await api.updateItem(item.id, { isFavorite: !item.isFavorite });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i))
      );
      setAllItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i))
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.deleteItem(item.id);
      refreshAll();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await api.seed();
      await refreshAll();
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const itemCounts = {
    ALL: allItems.length,
    BOOKMARK: allItems.filter((i) => i.type === 'BOOKMARK').length,
    SNIPPET: allItems.filter((i) => i.type === 'SNIPPET').length,
    NOTE: allItems.filter((i) => i.type === 'NOTE').length,
    FAVORITES: allItems.filter((i) => i.isFavorite).length,
  };

  return (
    <div id="app">
      {/* Sidebar Navigation */}
      <Sidebar
        currentFilter={filter}
        onFilterChange={setFilter}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        itemCounts={itemCounts}
        tags={tags}
        onSeed={handleSeed}
        isSeeding={isSeeding}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div id="main">
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
          onOpenAddModal={handleOpenAddModal}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Canvas Body */}
        <div id="canvas">
          <div className="canvas-inner">
            {/* Header row */}
            <div className="canvas-header">
              <div>
                <h2 className="canvas-title">
                  <span>{FILTER_TITLES[filter] || 'All Items'}</span>
                  <span className="canvas-count">{items.length}</span>
                </h2>
                <p className="canvas-subtitle">
                  {selectedTag ? (
                    <span>Filtered by tag #{selectedTag}</span>
                  ) : searchQuery ? (
                    <span>Results for &ldquo;{searchQuery}&rdquo;</span>
                  ) : (
                    'Organize and access your bookmarks, snippets, and notes'
                  )}
                </p>
              </div>

              {/* Quick Actions & Filter Pills */}
              <div className="canvas-quick-actions">
                {selectedTag && (
                  <button
                    type="button"
                    className="filter-pill"
                    onClick={() => setSelectedTag(null)}
                  >
                    <X className="w-3 h-3" />
                    <span>Clear #{selectedTag}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleOpenAddModal('BOOKMARK')}
                >
                  <Plus className="w-3 h-3" />
                  <span>Bookmark</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleOpenAddModal('SNIPPET')}
                >
                  <Plus className="w-3 h-3" />
                  <span>Snippet</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleOpenAddModal('NOTE')}
                >
                  <Plus className="w-3 h-3" />
                  <span>Note</span>
                </button>
              </div>
            </div>

            {/* Cards Container */}
            {isLoading ? (
              <div className={viewMode === 'list' ? 'cards-list' : 'cards-grid'}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="skeleton" />
                ))}
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div id="empty-state">
                <div className="empty-icon">
                  <Inbox className="w-5 h-5 text-neutral-400" />
                </div>
                <h3>{searchQuery || selectedTag ? 'No matching items' : 'Vault is empty'}</h3>
                <p>
                  {searchQuery || selectedTag
                    ? 'Try adjusting your search terms or clearing the selected tag filter.'
                    : 'Save web links, code snippets, or markdown notes to build your personal library.'}
                </p>
                <div className="empty-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleOpenAddModal('BOOKMARK')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleSeed}
                    disabled={isSeeding}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isSeeding ? 'Loading...' : 'Load Sample Data'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Cards Grid or List */
              <div className={viewMode === 'list' ? 'cards-list' : 'cards-grid'}>
                {items.map((item) => {
                  if (item.type === 'BOOKMARK') {
                    return (
                      <BookmarkCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectTag={setSelectedTag}
                      />
                    );
                  }
                  if (item.type === 'SNIPPET') {
                    return (
                      <SnippetCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        onToggleFavorite={handleToggleFavorite}
                        onView={handleViewItem}
                        onSelectTag={setSelectedTag}
                      />
                    );
                  }
                  return (
                    <NoteCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      onToggleFavorite={handleToggleFavorite}
                      onView={handleViewItem}
                      onSelectTag={setSelectedTag}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialType={addModalType}
        onSaved={refreshAll}
      />

      <EditItemModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSaved={refreshAll}
      />

      <ItemDetailModal
        item={viewingItem}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingItem(null);
        }}
        onEdit={handleEditItem}
        onSelectTag={(t) => {
          setSelectedTag(t);
        }}
      />

      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        items={allItems}
        onSelectItem={handleViewItem}
        onOpenAddModal={handleOpenAddModal}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
