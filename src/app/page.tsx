'use client';

import React, { useState, useEffect } from 'react';
import { FilterType, Item, ItemType, ViewMode } from '@/lib/types';
import { useItems } from '@/hooks/useItems';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BookmarkCard } from '@/components/cards/BookmarkCard';
import { SnippetCard } from '@/components/cards/SnippetCard';
import { NoteCard } from '@/components/cards/NoteCard';
import { AddItemModal } from '@/components/modals/AddItemModal';
import { EditItemModal } from '@/components/modals/EditItemModal';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { CommandMenu } from '@/components/modals/CommandMenu';
import { Plus, Inbox, X, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Navigation & Filter State
  const [currentFilter, setCurrentFilter] = useState<FilterType>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<ItemType>('BOOKMARK');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch Items
  const { data: items = [], isLoading } = useItems({
    search: searchQuery,
    type: currentFilter,
    tag: selectedTag,
  });

  // Calculate item counts
  const allItemsQuery = useItems();
  const allItems = allItemsQuery.data || [];

  const itemCounts = {
    ALL: allItems.length,
    BOOKMARK: allItems.filter((i) => i.type === 'BOOKMARK').length,
    SNIPPET: allItems.filter((i) => i.type === 'SNIPPET').length,
    NOTE: allItems.filter((i) => i.type === 'NOTE').length,
    FAVORITES: allItems.filter((i) => i.isFavorite).length,
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAddModal = (type: ItemType = 'BOOKMARK') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleViewItem = (item: Item) => {
    setViewingItem(item);
    setIsDetailModalOpen(true);
  };

  const handleSeedVault = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    } catch (e) {
      console.error(e);
    }
  };

  const filterTitles: Record<FilterType, string> = {
    ALL: 'All Items',
    BOOKMARK: 'Bookmarks',
    SNIPPET: 'Snippets',
    NOTE: 'Notes',
    FAVORITES: 'Favorites',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100/50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100">
      {/* Left Sidebar */}
      <Sidebar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        itemCounts={itemCounts}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
          onOpenAddModal={handleOpenAddModal}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Canvas Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-6xl mx-auto space-y-5">
            {/* Header Title & Filter Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {filterTitles[currentFilter]}
                  </h2>
                  <span className="px-1.5 py-0.2 rounded text-[11px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-200/70 dark:bg-neutral-800">
                    {items.length}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {selectedTag ? (
                    <span className="inline-flex items-center gap-1">
                      Filtered by tag <span className="font-medium text-neutral-900 dark:text-neutral-100">#{selectedTag}</span>
                    </span>
                  ) : searchQuery ? (
                    <span>Results for &ldquo;{searchQuery}&rdquo;</span>
                  ) : (
                    'Organize and access your bookmarks, snippets, and notes'
                  )}
                </p>
              </div>

              {/* Quick Filter Pill Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <span>Clear #{selectedTag}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={() => handleOpenAddModal('BOOKMARK')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 text-[11px] font-medium transition-colors"
                >
                  <Plus className="w-3 h-3 text-neutral-400" />
                  <span>Bookmark</span>
                </button>

                <button
                  onClick={() => handleOpenAddModal('SNIPPET')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 text-[11px] font-medium transition-colors"
                >
                  <Plus className="w-3 h-3 text-neutral-400" />
                  <span>Snippet</span>
                </button>

                <button
                  onClick={() => handleOpenAddModal('NOTE')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 text-[11px] font-medium transition-colors"
                >
                  <Plus className="w-3 h-3 text-neutral-400" />
                  <span>Note</span>
                </button>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
                }
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-36 rounded-xl bg-neutral-200/50 dark:bg-neutral-900/50 animate-pulse border border-neutral-200 dark:border-neutral-800"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  {searchQuery || selectedTag ? 'No matching items' : 'Vault is empty'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mb-5">
                  {searchQuery || selectedTag
                    ? 'Try adjusting your search terms or clearing tag filters.'
                    : 'Save links, code snippets, or markdown notes to build your library.'}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddModal('BOOKMARK')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>

                  <button
                    onClick={handleSeedVault}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 text-xs font-medium transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Load Sample Data</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Item Cards Grid / List */
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
                }
              >
                {items.map((item) => {
                  if (item.type === 'BOOKMARK') {
                    return (
                      <BookmarkCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onEdit={handleEditItem}
                        onTagClick={(tag) => setSelectedTag(tag)}
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
                        onView={handleViewItem}
                        onTagClick={(tag) => setSelectedTag(tag)}
                      />
                    );
                  }

                  return (
                    <NoteCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      onEdit={handleEditItem}
                      onView={handleViewItem}
                      onTagClick={(tag) => setSelectedTag(tag)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialType={addModalType}
      />

      <EditItemModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
      />

      <ItemDetailModal
        item={viewingItem}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingItem(null);
        }}
        onEdit={handleEditItem}
        onTagClick={(tag) => setSelectedTag(tag)}
      />

      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        items={allItems}
        onSelectItem={handleViewItem}
        onOpenAddModal={handleOpenAddModal}
      />
    </div>
  );
}
