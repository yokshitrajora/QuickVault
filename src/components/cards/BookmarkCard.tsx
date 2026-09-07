'use client';

import React, { useState } from 'react';
import { Item, ViewMode } from '@/lib/types';
import { ExternalLink, Star, Trash2, Edit3, Globe, Copy, Check } from 'lucide-react';
import { useToggleFavorite, useDeleteItem } from '@/hooks/useItems';

interface BookmarkCardProps {
  item: Item;
  viewMode?: ViewMode;
  onEdit?: (item: Item) => void;
  onTagClick?: (tag: string) => void;
}

export function BookmarkCard({
  item,
  viewMode = 'grid',
  onEdit,
  onTagClick,
}: BookmarkCardProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteItem = useDeleteItem();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const domain = item.url
    ? new URL(item.url.startsWith('http') ? item.url : `https://${item.url}`).hostname.replace(/^www\./, '')
    : 'web';

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url) {
      navigator.clipboard.writeText(item.url);
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
    if (confirm(`Delete bookmark "${item.title}"?`)) {
      deleteItem.mutate(item.id);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700">
            {item.favicon && !imgError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.favicon}
                alt=""
                className="w-4 h-4 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Globe className="w-4 h-4 text-neutral-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <a
                href={item.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline truncate text-xs sm:text-sm flex items-center gap-1.5"
              >
                <span>{item.title}</span>
                <ExternalLink className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono shrink-0">
                {domain}
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

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={handleCopyLink}
            title={copied ? 'Copied' : 'Copy link'}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleToggleFav}
            title={item.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
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
    <div className="group flex flex-col rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all overflow-hidden">
      {item.ogImage && (
        <div className="relative w-full h-32 bg-neutral-100 dark:bg-neutral-800 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.ogImage}
            alt=""
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs rounded px-2 py-0.5 text-[10px] text-white font-mono">
            {domain}
          </div>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700">
                {item.favicon ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.favicon} alt="" className="w-3 h-3 object-contain" />
                ) : (
                  <Globe className="w-3 h-3 text-neutral-400" />
                )}
              </div>
              {!item.ogImage && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono truncate">
                  {domain}
                </span>
              )}
            </div>

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

          <a
            href={item.url || '#'}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline text-sm leading-snug line-clamp-2 inline-flex items-center gap-1"
          >
            <span>{item.title}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 shrink-0" />
          </a>

          {item.description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
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
              onClick={handleCopyLink}
              title={copied ? 'Copied' : 'Copy link'}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-neutral-900 dark:text-neutral-100" /> : <Copy className="w-3 h-3" />}
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
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
    </div>
  );
}
