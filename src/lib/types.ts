export type ItemType = 'BOOKMARK' | 'SNIPPET' | 'NOTE';

export interface Tag {
  id: string;
  name: string;
  count?: number;
}

export interface ItemTag {
  itemId: string;
  tagId: string;
  tag: Tag;
}

export interface Item {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  description?: string | null;
  url?: string | null;
  content?: string | null;
  language?: string | null;
  ogImage?: string | null;
  favicon?: string | null;
  isFavorite: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  itemTags?: { tag: Tag }[];
  tags?: string[];
}

export interface CreateItemPayload {
  type: ItemType;
  title: string;
  description?: string;
  url?: string;
  content?: string;
  language?: string;
  ogImage?: string;
  favicon?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface UpdateItemPayload {
  title?: string;
  description?: string;
  url?: string;
  content?: string;
  language?: string;
  ogImage?: string;
  favicon?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface MetadataScrapeResult {
  title: string;
  description: string;
  ogImage: string | null;
  favicon: string | null;
  siteName?: string | null;
  url: string;
}

export type ViewMode = 'grid' | 'list';
export type FilterType = 'ALL' | 'BOOKMARK' | 'SNIPPET' | 'NOTE' | 'FAVORITES';
