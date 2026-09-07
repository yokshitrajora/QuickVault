'use client';

import React from 'react';
import { FilterType } from '@/lib/types';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '../providers/Providers';
import {
  LayoutGrid,
  Bookmark,
  Code2,
  FileText,
  Star,
  Tag as TagIcon,
  LogOut,
  X,
  LucideIcon,
  Sparkles,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface SidebarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  itemCounts?: {
    ALL: number;
    BOOKMARK: number;
    SNIPPET: number;
    NOTE: number;
    FAVORITES: number;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  currentFilter,
  onFilterChange,
  selectedTag,
  onTagSelect,
  itemCounts,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { data: tags = [] } = useTags();
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = React.useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const navItems: { type: FilterType; label: string; icon: LucideIcon; count?: number }[] = [
    { type: 'ALL', label: 'All Items', icon: LayoutGrid, count: itemCounts?.ALL },
    { type: 'BOOKMARK', label: 'Bookmarks', icon: Bookmark, count: itemCounts?.BOOKMARK },
    { type: 'SNIPPET', label: 'Snippets', icon: Code2, count: itemCounts?.SNIPPET },
    { type: 'NOTE', label: 'Notes', icon: FileText, count: itemCounts?.NOTE },
    { type: 'FAVORITES', label: 'Favorites', icon: Star, count: itemCounts?.FAVORITES },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-60 bg-neutral-50/70 dark:bg-neutral-950/70 backdrop-blur-md border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Minimal Logo */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs font-mono">
                Q
              </div>
              <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                QuickVault
              </span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentFilter === item.type && !selectedTag;

              return (
                <button
                  key={item.type}
                  onClick={() => {
                    onFilterChange(item.type);
                    onTagSelect(null);
                    onClose?.();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    isActive
                      ? 'bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-medium'
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Tags */}
          <div className="flex-1 min-h-[120px]">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                <TagIcon className="w-3 h-3" />
                <span>Tags</span>
              </span>
              {selectedTag && (
                <button
                  onClick={() => onTagSelect(null)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Reset
                </button>
              )}
            </div>

            {tags.length === 0 ? (
              <p className="text-[11px] text-neutral-400 dark:text-neutral-600 px-1">
                No tags yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => {
                  const isSelected = selectedTag === tag.name;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        onTagSelect(isSelected ? null : tag.name);
                        onClose?.();
                      }}
                      className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors ${
                        isSelected
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                          : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      <span>#{tag.name}</span>
                      {tag.count !== undefined && (
                        <span className="text-[9px] opacity-60 font-mono">
                          {tag.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Minimal Seed Action */}
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-[11px] transition-colors"
            >
              <Sparkles className="w-3 h-3 text-neutral-400" />
              <span>{isSeeding ? 'Seeding...' : 'Load Sample Data'}</span>
            </button>
          </div>
        </div>

        {/* Minimal User Profile */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
