'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Item, ItemType } from '@/lib/types';
import {
  Search,
  Bookmark,
  Code2,
  FileText,
  Plus,
  Moon,
  Sun,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../providers/Providers';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onSelectItem: (item: Item) => void;
  onOpenAddModal: (type: ItemType) => void;
}

export function CommandMenu({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onOpenAddModal,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.url?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const displayItems = filteredItems.slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (displayItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayItems.length) % (displayItems.length || 1));
    } else if (e.key === 'Enter' && displayItems[selectedIndex]) {
      e.preventDefault();
      onSelectItem(displayItems[selectedIndex]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search or select an action..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Action Shortcuts if query is empty */}
        {!query && (
          <div className="p-2.5 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 text-xs">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 px-1.5">
              Quick Actions
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal('BOOKMARK');
                }}
                className="flex items-center gap-1.5 p-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs transition-colors"
              >
                <Plus className="w-3 h-3 text-neutral-400" />
                <span className="truncate">Bookmark</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal('SNIPPET');
                }}
                className="flex items-center gap-1.5 p-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs transition-colors"
              >
                <Plus className="w-3 h-3 text-neutral-400" />
                <span className="truncate">Snippet</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal('NOTE');
                }}
                className="flex items-center gap-1.5 p-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs transition-colors"
              >
                <Plus className="w-3 h-3 text-neutral-400" />
                <span className="truncate">Note</span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                  onClose();
                }}
                className="flex items-center gap-1.5 p-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3 h-3 text-neutral-400" />
                ) : (
                  <Moon className="w-3 h-3 text-neutral-400" />
                )}
                <span className="truncate">Theme</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="max-h-72 overflow-y-auto p-1.5">
          {displayItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">
              <p>No results found</p>
            </div>
          ) : (
            displayItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-600 dark:text-neutral-300">
                      {item.type === 'BOOKMARK' && <Bookmark className="w-3 h-3" />}
                      {item.type === 'SNIPPET' && <Code2 className="w-3 h-3" />}
                      {item.type === 'NOTE' && <FileText className="w-3 h-3" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {item.description || item.url || item.content?.slice(0, 50)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-xs">
                    {item.tags && item.tags.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 font-mono">
                        #{item.tags[0]}
                      </span>
                    )}
                    <ArrowRight className="w-3 h-3 text-neutral-400 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <span>Navigate with ↑ ↓ and press ↵</span>
          <span>QuickVault</span>
        </div>
      </div>
    </div>
  );
}
