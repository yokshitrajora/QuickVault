import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

const SAMPLE_ITEMS = [
  {
    type: 'BOOKMARK',
    title: 'Vite — Next Generation Frontend Tooling',
    url: 'https://vitejs.dev',
    description: 'An opinionated web dev build tool that serves your code via native ES Module imports during dev.',
    tags: ['vite', 'javascript', 'frontend', 'tooling'],
  },
  {
    type: 'BOOKMARK',
    title: 'Prisma — Next-generation Node.js ORM',
    url: 'https://www.prisma.io',
    description: 'Open source ORM for Node.js and TypeScript. Auto-completion, migrations, and type safety.',
    tags: ['orm', 'database', 'nodejs', 'prisma'],
  },
  {
    type: 'SNIPPET',
    title: 'Express.js REST server scaffold',
    language: 'javascript',
    description: 'Minimal Express boilerplate with JSON parsing and CORS.',
    content: `import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(3001, () => console.log('Server running on :3001'));`,
    tags: ['express', 'nodejs', 'boilerplate'],
  },
  {
    type: 'SNIPPET',
    title: 'Debounce utility function',
    language: 'javascript',
    description: 'A simple debounce implementation for search inputs.',
    content: `function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Usage
const onSearch = debounce((query) => {
  console.log('Searching:', query);
}, 400);`,
    tags: ['javascript', 'utility', 'performance'],
  },
  {
    type: 'NOTE',
    title: 'QuickVault — Getting Started',
    content: `# QuickVault

Your minimal smart hub for **bookmarks**, **code snippets**, and **notes**.

## Features

- 🔖 **Bookmarks** with auto-scraped metadata (Open Graph title, description, image, favicon)
- 💻 **Snippets** with Prism.js syntax highlighting and 1-click copy
- 📝 **Notes** in Markdown with live preview
- 🏷️ **Tags** for organized filtering
- 🔍 **Instant search** and \`Cmd+K\` command palette
- 🌓 **Dark / Light mode**

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| \`Cmd+K\` | Open command palette |
| \`Esc\` | Close any modal |
`,
    tags: ['quickvault', 'docs', 'getting-started'],
  },
];

// POST /api/seed
router.post('/', async (req, res) => {
  const userId = req.user.id;

  try {
    for (const sample of SAMPLE_ITEMS) {
      const tagRecords = await Promise.all(
        (sample.tags || []).map((name) =>
          prisma.tag.upsert({
            where: { name_userId: { name, userId } },
            update: {},
            create: { name, userId },
          })
        )
      );

      await prisma.item.create({
        data: {
          type: sample.type,
          title: sample.title,
          url: sample.url || null,
          description: sample.description || null,
          content: sample.content || null,
          language: sample.language || null,
          isFavorite: false,
          userId,
          tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
        },
      });
    }

    res.json({ seeded: SAMPLE_ITEMS.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Seed failed' });
  }
});

export default router;
