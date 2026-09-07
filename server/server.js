import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { authMiddleware } from './auth.js';
import itemsRouter    from './routes/items.js';
import tagsRouter     from './routes/tags.js';
import metadataRouter from './routes/metadata.js';
import seedRouter     from './routes/seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/items',    authMiddleware, itemsRouter);
app.use('/api/tags',     authMiddleware, tagsRouter);
app.use('/api/metadata', authMiddleware, metadataRouter);
app.use('/api/seed',     authMiddleware, seedRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date() }));

// ── Static (production Vite build) ────────────────────────────────────────────
const distDir = join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (req, res) => {
  res.sendFile(join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  QuickVault API  →  http://localhost:${PORT}\n`);
});
