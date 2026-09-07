import prisma from './prisma.js';

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@quickvault.dev';
const DEMO_NAME  = process.env.DEMO_USER_NAME  || 'Demo User';

/**
 * Returns (and upserts) the demo user for local development.
 * In production this would parse a real Auth0 JWT from the Authorization header.
 */
export async function getUser(req) {
  const user = await prisma.user.upsert({
    where:  { auth0Id: 'demo|local' },
    update: {},
    create: {
      auth0Id: 'demo|local',
      email:   DEMO_EMAIL,
      name:    DEMO_NAME,
      avatar:  `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(DEMO_NAME)}`,
    },
  });
  return user;
}

/** Express middleware — attaches req.user */
export async function authMiddleware(req, res, next) {
  try {
    req.user = await getUser(req);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
