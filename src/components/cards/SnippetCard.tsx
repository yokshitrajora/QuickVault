'use client';

import React, { useState } from 'react';
import { Item, ViewMode } from '@/lib/types';
import { Code2, Copy, Check, Star, Trash2, Edit3, Maximize2 } from 'lucide-react';
import { useToggleFavorite, useDeleteItem } from '@/hooks/useItems';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SnippetCardProps {
  item: Item;
  viewMode?: ViewMode;
  onEdit?: (item: Item) => void;
  onView?: (item: Item) => void;
  onTagClick?: (tag: string) => void;
}

export function SnippetCard({
  item,
  viewMode = 'grid',
  onEdit,
  onView,
  onTagClick,
}: SnippetCardProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteItem = useDeleteItem();
  const [copied, setCopied] = useState(false);

  const lang = (item.language || 'javascript').toLowerCase();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.content) {
      navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate({ id: item.id, isFavorite: !item.isFavorite });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete snippet "${item.title}"?`)) {
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
            <Code2 className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate text-xs sm:text-sm">
                {item.title}
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono shrink-0">
                {lang}
              </span>
            </div>

            {item.description && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {item.description}
              </p>
            )}

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
            onClick={handleCopy}
            title={copied ? 'Copied' : 'Copy Code'}
            className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-neutral-900 dark:text-neutral-100" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
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
            {lang}
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

        {item.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}
      </div>

      {/* Code syntax block preview */}
      <div className="relative mx-3.5 my-1 rounded-lg overflow-hidden bg-neutral-950 text-neutral-200 border border-neutral-800 text-xs font-mono">
        <div className="flex items-center justify-between px-3 py-1 bg-neutral-900/90 border-b border-neutral-800 text-[10px] text-neutral-400">
          <span>{lang}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-white" />
                <span className="text-white">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="max-h-36 overflow-hidden relative">
          <SyntaxHighlighter
            language={lang}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '0.65rem',
              fontSize: '0.72rem',
              lineHeight: '1.15rem',
              background: 'transparent',
            }}
            showLineNumbers
          >
            {item.content || '// Empty snippet'}
          </SyntaxHighlighter>
          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
        </div>
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
