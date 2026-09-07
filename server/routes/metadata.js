import { Router } from 'express';
import { scrapeMetadata } from '../scraper.js';

const router = Router();

// POST /api/metadata  body: { url }
router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    const data = await scrapeMetadata(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to scrape metadata' });
  }
});

export default router;
