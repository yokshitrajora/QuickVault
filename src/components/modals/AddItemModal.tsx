'use client';

import React, { useState } from 'react';
import { ItemType, CreateItemPayload } from '@/lib/types';
import { useCreateItem } from '@/hooks/useItems';
import {
  X,
  Bookmark,
  Code2,
  FileText,
  Loader2,
  Sparkles,
  Star,
  Globe,
  Tag as TagIcon,
  Eye,
  Edit2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ItemType;
}

const LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'rust',
  'go',
  'sql',
  'html',
  'css',
  'json',
  'bash',
  'csharp',
  'cpp',
  'java',
  'yaml',
  'markdown',
];

export function AddItemModal({ isOpen, onClose, initialType = 'BOOKMARK' }: AddItemModalProps) {
  const [activeType, setActiveType] = useState<ItemType>(initialType);
  const createItem = useCreateItem();

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Metadata Scraper State
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // Markdown Editor Sub-tab
  const [markdownTab, setMarkdownTab] = useState<'write' | 'preview'>('write');

  if (!isOpen) return null;

  const handleFetchMetadata = async () => {
    if (!url.trim()) return;

    setIsScraping(true);
    setScrapeError(null);

    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) throw new Error('Could not scrape URL metadata');
      const data = await res.json();

      if (data.title && !title) setTitle(data.title);
      if (data.description && !description) setDescription(data.description);
      if (data.ogImage) setOgImage(data.ogImage);
      if (data.favicon) setFavicon(data.favicon);
    } catch {
      setScrapeError('Auto-fill failed. Enter details manually.');
    } finally {
      setIsScraping(false);
    }
  };

  const addTag = (text: string) => {
    const clean = text.trim().toLowerCase().replace(/^[#,]/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleBlurTag = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: CreateItemPayload = {
      type: activeType,
      title: title.trim(),
      description: description.trim() || undefined,
      url: activeType === 'BOOKMARK' ? url.trim() || undefined : undefined,
      content: activeType !== 'BOOKMARK' ? content : undefined,
      language: activeType === 'SNIPPET' ? language : undefined,
      ogImage: ogImage || undefined,
      favicon: favicon || undefined,
      tags,
      isFavorite,
    };

    await createItem.mutateAsync(payload);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setContent('');
    setLanguage('typescript');
    setOgImage(null);
    setFavicon(null);
    setIsFavorite(false);
    setTags([]);
    setTagInput('');
    setScrapeError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Type Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveType('BOOKMARK')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                activeType === 'BOOKMARK'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmark</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType('SNIPPET')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                activeType === 'SNIPPET'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Snippet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType('NOTE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                activeType === 'NOTE'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Minimal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* BOOKMARK */}
          {activeType === 'BOOKMARK' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={() => {
                        if (url && !title) handleFetchMetadata();
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchMetadata}
                    disabled={isScraping || !url}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium disabled:opacity-50 transition-colors shrink-0"
                  >
                    {isScraping ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Scrape</span>
                  </button>
                </div>
                {scrapeError && <p className="text-[10px] text-neutral-500 mt-1">{scrapeError}</p>}
              </div>

              {/* Scraped Preview */}
              {(ogImage || favicon) && (
                <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {ogImage && (
                    <img
                      src={ogImage}
                      alt="OG"
                      className="w-12 h-9 object-cover rounded shrink-0 border border-neutral-200 dark:border-neutral-800"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {title || 'Scraped metadata attached'}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {description || url}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Bookmark title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes or description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 resize-none"
                />
              </div>
            </>
          )}

          {/* CODE SNIPPET */}
          {activeType === 'SNIPPET' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Snippet title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 capitalize font-mono"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Code
                </label>
                <textarea
                  rows={7}
                  placeholder="// Paste code here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:border-neutral-700 resize-y"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                />
              </div>
            </>
          )}

          {/* MARKDOWN NOTE */}
          {activeType === 'NOTE' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                    Content
                  </label>
                  <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded text-xs">
                    <button
                      type="button"
                      onClick={() => setMarkdownTab('write')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                        markdownTab === 'write'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium'
                          : 'text-neutral-500'
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Write</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkdownTab('preview')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                        markdownTab === 'preview'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium'
                          : 'text-neutral-500'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {markdownTab === 'write' ? (
                  <textarea
                    rows={7}
                    placeholder="# Heading&#10;&#10;Write markdown notes..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 resize-y"
                    required
                  />
                ) : (
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 min-h-[10rem] max-h-60 overflow-y-auto prose prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || '*No content entered yet.*'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAGS */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <TagIcon className="w-3.5 h-3.5 text-neutral-400 ml-1" />
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={tags.length === 0 ? 'add tags (press Enter)...' : 'add tag...'}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                onBlur={handleBlurTag}
                className="flex-1 min-w-[100px] bg-transparent text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none px-1.5 py-0.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors ${
                isFavorite
                  ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'In Favorites' : 'Favorite'}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createItem.isPending || !title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium disabled:opacity-50 transition-all"
            >
              {createItem.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
