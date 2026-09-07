import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { itemTags: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedTags = tags.map((t) => ({
      id: t.id,
      name: t.name,
      count: t._count.itemTags,
    }));

    return NextResponse.json(formattedTags);
  } catch (error: unknown) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
