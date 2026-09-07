import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export interface AuthUser {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  avatar?: string | null;
  isDemo?: boolean;
}

const DEMO_USER: AuthUser = {
  id: 'usr_quickvault_demo_01',
  auth0Id: 'auth0|demo_user_quickvault_default',
  email: 'alex.developer@quickvault.io',
  name: 'Alex Rivera',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isDemo: true,
};

export async function getOrCreateUser(authUser: AuthUser) {
  let user = await prisma.user.findUnique({
    where: { auth0Id: authUser.auth0Id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        auth0Id: authUser.auth0Id,
        email: authUser.email,
        name: authUser.name,
        avatar: authUser.avatar,
      },
    });
  }

  return user;
}

export async function getAuthenticatedUser(req?: NextRequest): Promise<AuthUser> {
  try {
    const demoHeader = req?.headers.get('x-demo-user');
    if (demoHeader) {
      const demoUser = {
        id: `usr_${demoHeader}`,
        auth0Id: `auth0|${demoHeader}`,
        email: `${demoHeader}@quickvault.io`,
        name: demoHeader.charAt(0).toUpperCase() + demoHeader.slice(1),
        avatar: null,
        isDemo: true,
      };
      await getOrCreateUser(demoUser);
      return demoUser;
    }

    const isAuth0Configured =
      process.env.AUTH0_DOMAIN &&
      process.env.AUTH0_CLIENT_ID &&
      !process.env.AUTH0_DOMAIN.includes('your-tenant');

    if (isAuth0Configured) {
      const auth0 = new Auth0Client();
      const session = await (req ? auth0.getSession(req) : auth0.getSession());
      if (session?.user) {
        const authUser: AuthUser = {
          id: `usr_${session.user.sub.replace(/[^a-zA-Z0-9]/g, '_')}`,
          auth0Id: session.user.sub,
          email: session.user.email || `${session.user.sub}@auth0.user`,
          name: session.user.name || session.user.nickname || 'QuickVault User',
          avatar: session.user.picture || null,
          isDemo: false,
        };
        await getOrCreateUser(authUser);
        return authUser;
      }
    }
  } catch {
    // Fallback gracefully to demo user when Auth0 session is not present or configured
  }

  await getOrCreateUser(DEMO_USER);
  return DEMO_USER;
}
