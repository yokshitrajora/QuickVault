'use client';

import React from 'react';
import { Item, ViewMode } from '@/lib/types';
import { FileText, Star, Trash2, Edit3, Maximize2 } from 'lucide-react';
import { useToggleFavorite, useDeleteItem } from '@/hooks/useItems';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteCardProps {
  item: Item;
  viewMode?: ViewMode;
  onEdit?: (item: Item) => void;
  onView?: (item: Item) => void;
  onTagClick?: (tag: string) => void;
}

export function NoteCard({
  item,
  viewMode = 'grid',
  onEdit,
  onView,
  onTagClick,
}: NoteCardProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteItem = useDeleteItem();

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate({ id: item.id, isFavorite: !item.isFavorite });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete note "${item.title}"?`)) {
      deleteItem.mutate(item.id);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onView?.(item)}
        className="group cursor-pointer relative flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
            <FileText className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate text-xs sm:text-sm">
                {item.title}
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono shrink-0">
                NOTE
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              {item.content?.slice(0, 80).replace(/[#*`_]/g, '') || 'Empty note...'}
            </p>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleToggleFav}
            className={`p-1.5 rounded-md transition-colors ${
              item.isFavorite
                ? 'text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              title="Edit"
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1.5 rounded-md text-neutral-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onView?.(item)}
      className="group cursor-pointer flex flex-col rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all overflow-hidden"
    >
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            MARKDOWN
          </span>

          <button
            onClick={handleToggleFav}
            className={`p-1 rounded transition-colors ${
              item.isFavorite
                ? 'text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm leading-snug line-clamp-1">
          {item.title}
        </h3>
      </div>

      {/* Markdown rendered excerpt */}
      <div className="mx-4 my-1 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-700 dark:text-neutral-300 max-h-32 overflow-hidden relative">
        <div className="prose prose-xs dark:prose-invert max-w-none line-clamp-3 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {item.content || '*Empty note*'}
          </ReactMarkdown>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-neutral-50 dark:from-neutral-950 to-transparent pointer-events-none" />
      </div>

      <div className="p-3.5 pt-2 mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-wrap gap-1 min-w-0">
          {item.tags && item.tags.length > 0 ? (
            item.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono transition-colors"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="text-[10px] text-neutral-400 font-mono">no tags</span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.(item);
            }}
            title="Expand View"
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              title="Edit"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1 rounded text-neutral-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
