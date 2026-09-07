'use client';

import React from 'react';
import { ViewMode, ItemType } from '@/lib/types';
import { useTheme } from '../providers/Providers';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenCommandMenu: () => void;
  onOpenAddModal: (type?: ItemType) => void;
  onToggleMobileSidebar: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenCommandMenu,
  onOpenAddModal,
  onToggleMobileSidebar,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Menu & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Minimal Search Bar */}
        <div
          onClick={onOpenCommandMenu}
          className="relative flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer transition-all text-xs"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search items, tags, code..."
            value={searchQuery}
            onChange={(e) => {
              e.stopPropagation();
              onSearchChange(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none text-xs"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-400">
            <span>⌘K</span>
          </kbd>
        </div>
      </div>

      {/* Right Actions: View Toggle, Theme, Add New */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Grid / List Switcher */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            title="List View"
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Add New Button */}
        <button
          onClick={() => onOpenAddModal('BOOKMARK')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Item</span>
        </button>
      </div>
    </header>
  );
}
