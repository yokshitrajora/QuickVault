'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/types';
import { X, Copy, Check, Star, ExternalLink, Calendar, Tag as TagIcon, Edit3 } from 'lucide-react';
import { useToggleFavorite } from '@/hooks/useItems';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: Item) => void;
  onTagClick?: (tag: string) => void;
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onEdit,
  onTagClick,
}: ItemDetailModalProps) {
  const toggleFavorite = useToggleFavorite();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopy = () => {
    const textToCopy = item.type === 'BOOKMARK' ? item.url : item.content;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFav = () => {
    toggleFavorite.mutate({ id: item.id, isFavorite: !item.isFavorite });
  };

  const lang = (item.language || 'typescript').toLowerCase();
  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {item.type === 'SNIPPET' ? lang : item.type}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {item.description}
              </p>
            )}
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
              <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {item.type === 'BOOKMARK' && (
            <div className="space-y-3">
              {item.ogImage && (
                <div className="w-full h-56 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.ogImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 text-xs font-mono transition-colors"
                >
                  <span className="truncate">{item.url}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              )}
            </div>
          )}

          {item.type === 'SNIPPET' && (
            <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400">
                <span className="font-mono">{lang}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <SyntaxHighlighter
                language={lang}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.78rem',
                  lineHeight: '1.25rem',
                  background: 'transparent',
                }}
                showLineNumbers
              >
                {item.content || '// Empty snippet'}
              </SyntaxHighlighter>
            </div>
          )}

          {item.type === 'NOTE' && (
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 prose prose-xs dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.content || '*Empty note*'}
              </ReactMarkdown>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                <TagIcon className="w-3 h-3" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onClose();
                      onTagClick?.(t);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono transition-colors"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
