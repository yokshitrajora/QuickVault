import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest, NextResponse } from 'next/server';

let auth0: Auth0Client | null = null;

try {
  if (
    process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_CLIENT_ID &&
    !process.env.AUTH0_DOMAIN.includes('your-tenant')
  ) {
    auth0 = new Auth0Client();
  }
} catch {
  console.warn('Auth0 client initialization skipped (demo mode active)');
}

export const GET = async (req: NextRequest) => {
  if (auth0) {
    return auth0.middleware(req);
  }
  return NextResponse.json({
    status: 'Demo Auth Mode Active',
    message: 'To enable full Auth0 production login, set AUTH0_* variables in .env',
  });
};

export const POST = async (req: NextRequest) => {
  if (auth0) {
    return auth0.middleware(req);
  }
  return NextResponse.json({ status: 'ok' });
};
