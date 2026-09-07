import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// GET /api/tags — user's tags with item counts
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: { _count: { select: { items: true } } },
      orderBy: { items: { _count: 'desc' } },
    });

    res.json(tags.map((t) => ({ id: t.id, name: t.name, count: t._count.items })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

export default router;
