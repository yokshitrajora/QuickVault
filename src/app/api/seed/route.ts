import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    // Initial starter collection
    const sampleItems = [
      {
        type: 'BOOKMARK',
        title: 'Next.js 14 App Router Documentation & Server Actions',
        url: 'https://nextjs.org/docs/app',
        description: 'The React Framework for the Web. Used by some of the world\'s largest companies, Next.js enables you to create full-stack Web applications by extending the latest React features.',
        ogImage: 'https://nextjs.org/api/docs-og?title=Next.js%20App%20Router%20Documentation',
        favicon: 'https://www.google.com/s2/favicons?domain=nextjs.org&sz=128',
        isFavorite: true,
        tags: ['react', 'nextjs', 'fullstack'],
      },
      {
        type: 'BOOKMARK',
        title: 'Tailwind CSS - Rapidly build modern websites without ever leaving your HTML',
        url: 'https://tailwindcss.com',
        description: 'A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.',
        ogImage: 'https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg',
        favicon: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=128',
        isFavorite: false,
        tags: ['css', 'styling', 'frontend'],
      },
      {
        type: 'SNIPPET',
        title: 'Safe Prisma Connection Singleton (Next.js)',
        description: 'Prevents multiple Prisma Client instances during development hot-reloading in Next.js App Router.',
        language: 'typescript',
        content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;`,
        isFavorite: true,
        tags: ['typescript', 'prisma', 'database', 'nextjs'],
      },
      {
        type: 'SNIPPET',
        title: 'Cheerio Open Graph & Favicon Scraper Function',
        description: 'Extracts title, meta descriptions, open graph image and high-resolution favicon from any web page.',
        language: 'typescript',
        content: `import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'QuickVault/1.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);

  return {
    title: $('meta[property="og:title"]').attr('content') || $('title').text(),
    description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
    ogImage: $('meta[property="og:image"]').attr('content'),
    favicon: $('link[rel="icon"]').attr('href') || \`https://www.google.com/s2/favicons?domain=\${new URL(url).hostname}&sz=128\`
  };
}`,
        isFavorite: false,
        tags: ['typescript', 'scraping', 'cheerio', 'backend'],
      },
      {
        type: 'NOTE',
        title: 'Architecture Blueprint: QuickVault Multi-Tenant Isolation',
        content: `# QuickVault Security & Architecture Guide

QuickVault provides high-performance bookmarking and developer knowledge management with strict row-level security.

### Core Tenets
1. **User Scoped Filtering**: Every Prisma query explicitly evaluates \`where: { userId: user.id }\`.
2. **Tag Multi-Tenancy**: Tags are uniquely indexed per-user \`@@unique([name, userId])\`, preventing cross-account data leaks.
3. **Scraper Sandbox**: Cheerio requests are executed server-side with strict 8-second timeouts and URL sanitization.

### Supported Item Types
- 🌐 **Web Bookmarks**: Instant OpenGraph metadata, preview thumbnails, domain identification.
- ⚡ **Code Snippets**: Fast multi-language syntax highlighting with 1-click clipboard copying.
- 📝 **Markdown Notes**: Rich formatting with live preview, tables, and task lists.`,
        isFavorite: true,
        tags: ['architecture', 'security', 'docs'],
      },
    ];

    for (const itemData of sampleItems) {
      const createdItem = await prisma.item.create({
        data: {
          userId: user.id,
          type: itemData.type,
          title: itemData.title,
          description: itemData.description || null,
          url: itemData.url || null,
          content: itemData.content || null,
          language: itemData.language || null,
          ogImage: itemData.ogImage || null,
          favicon: itemData.favicon || null,
          isFavorite: itemData.isFavorite,
        },
      });

      for (const tagName of itemData.tags) {
        let tag = await prisma.tag.findUnique({
          where: {
            name_userId: {
              name: tagName,
              userId: user.id,
            },
          },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              userId: user.id,
            },
          });
        }

        await prisma.itemTag.create({
          data: {
            itemId: createdItem.id,
            tagId: tag.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, count: sampleItems.length });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    const message = error instanceof Error ? error.message : 'Failed to seed database';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
