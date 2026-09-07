import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { CreateItemPayload } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const favorite = searchParams.get('favorite');

    // Build Prisma query with row-level user isolation
    const where: Prisma.ItemWhereInput = {
      userId: user.id,
    };

    if (type && ['BOOKMARK', 'SNIPPET', 'NOTE'].includes(type)) {
      where.type = type;
    }

    if (favorite === 'true') {
      where.isFavorite = true;
    }

    if (tag) {
      where.itemTags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { content: { contains: q } },
        { url: { contains: q } },
        { language: { contains: q } },
        {
          itemTags: {
            some: {
              tag: {
                name: { contains: q },
              },
            },
          },
        },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        itemTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedItems = items.map((item) => ({
      ...item,
      tags: item.itemTags.map((it) => it.tag.name),
    }));

    return NextResponse.json(formattedItems);
  } catch (error: unknown) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body: CreateItemPayload = await req.json();

    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Title and item type are required' },
        { status: 400 }
      );
    }

    // Process tags
    const tagNames = (body.tags || [])
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const createdItem = await prisma.item.create({
      data: {
        userId: user.id,
        type: body.type,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        url: body.url?.trim() || null,
        content: body.content || null,
        language: body.language || null,
        ogImage: body.ogImage || null,
        favicon: body.favicon || null,
        isFavorite: Boolean(body.isFavorite),
      },
    });

    // Link or create tags
    if (tagNames.length > 0) {
      for (const tagName of tagNames) {
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

    const fullItem = await prisma.item.findUnique({
      where: { id: createdItem.id },
      include: {
        itemTags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json(
      {
        ...fullItem,
        tags: fullItem?.itemTags.map((it) => it.tag.name) || [],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Failed to create item:', error);
    const message = error instanceof Error ? error.message : 'Failed to create item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
