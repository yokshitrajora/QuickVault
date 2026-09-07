import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/items  — list with search, type, tag, favorites filters
router.get('/', async (req, res) => {
  const { q, type, tag, favorites } = req.query;
  const userId = req.user.id;

  try {
    const items = await prisma.item.findMany({
      where: {
        userId,
        ...(type && type !== 'ALL' && type !== 'FAVORITES' ? { type } : {}),
        ...(favorites === 'true' ? { isFavorite: true } : {}),
        ...(tag
          ? { tags: { some: { tag: { name: tag, userId } } } }
          : {}),
        ...(q
          ? {
              OR: [
                { title:       { contains: q } },
                { description: { contains: q } },
                { url:         { contains: q } },
                { content:     { contains: q } },
                { tags: { some: { tag: { name: { contains: q } } } } },
              ],
            }
          : {}),
      },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map(formatItem);
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/items — create item
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { type, title, url, description, content, language, ogImage, favicon, tags = [], isFavorite = false } = req.body;

  if (!type || !title) return res.status(400).json({ error: 'type and title are required' });

  try {
    const tagRecords = await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({
          where: { name_userId: { name: name.toLowerCase().trim(), userId } },
          update: {},
          create: { name: name.toLowerCase().trim(), userId },
        })
      )
    );

    const item = await prisma.item.create({
      data: {
        type,
        title,
        url: url || null,
        description: description || null,
        content: content || null,
        language: language || null,
        ogImage: ogImage || null,
        favicon: favicon || null,
        isFavorite,
        userId,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });

    res.status(201).json(formatItem(item));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const item = await prisma.item.findFirst({
      where: { id: req.params.id, userId },
      include: { tags: { include: { tag: true } } },
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(formatItem(item));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// PATCH /api/items/:id — update item
router.patch('/:id', async (req, res) => {
  const userId = req.user.id;
  const { title, url, description, content, language, tags, isFavorite } = req.body;

  try {
    const existing = await prisma.item.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Rebuild tags if provided
    if (tags !== undefined) {
      await prisma.itemTag.deleteMany({ where: { itemId: req.params.id } });
      const tagRecords = await Promise.all(
        tags.map((name) =>
          prisma.tag.upsert({
            where: { name_userId: { name: name.toLowerCase().trim(), userId } },
            update: {},
            create: { name: name.toLowerCase().trim(), userId },
          })
        )
      );
      await prisma.itemTag.createMany({
        data: tagRecords.map((tag) => ({ itemId: req.params.id, tagId: tag.id })),
        skipDuplicates: true,
      });
    }

    const updated = await prisma.item.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(url !== undefined ? { url } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(language !== undefined ? { language } : {}),
        ...(isFavorite !== undefined ? { isFavorite } : {}),
      },
      include: { tags: { include: { tag: true } } },
    });

    res.json(formatItem(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const existing = await prisma.item.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.item.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

function formatItem(item) {
  return {
    ...item,
    tags: item.tags.map((it) => it.tag.name),
  };
}

export default router;
