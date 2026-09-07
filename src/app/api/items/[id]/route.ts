import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { UpdateItemPayload } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    const item = await prisma.item.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        itemTags: {
          include: { tag: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...item,
      tags: item.itemTags.map((it) => it.tag.name),
    });
  } catch (error: unknown) {
    console.error('Failed to get item:', error);
    return NextResponse.json({ error: 'Failed to retrieve item' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    const body: UpdateItemPayload = await req.json();

    const existingItem = await prisma.item.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updateData: Prisma.ItemUpdateInput = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.url !== undefined) updateData.url = body.url?.trim() || null;
    if (body.content !== undefined) updateData.content = body.content || null;
    if (body.language !== undefined) updateData.language = body.language || null;
    if (body.ogImage !== undefined) updateData.ogImage = body.ogImage || null;
    if (body.favicon !== undefined) updateData.favicon = body.favicon || null;
    if (body.isFavorite !== undefined) updateData.isFavorite = Boolean(body.isFavorite);

    await prisma.item.update({
      where: { id: params.id },
      data: updateData,
    });

    // Update tags if provided
    if (body.tags !== undefined) {
      await prisma.itemTag.deleteMany({
        where: { itemId: params.id },
      });

      const tagNames = body.tags
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

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
            itemId: params.id,
            tagId: tag.id,
          },
        });
      }
    }

    const updated = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        itemTags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json({
      ...updated,
      tags: updated?.itemTags.map((it) => it.tag.name) || [],
    });
  } catch (error: unknown) {
    console.error('Failed to update item:', error);
    const message = error instanceof Error ? error.message : 'Failed to update item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);

    const existingItem = await prisma.item.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.item.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, id: params.id });
  } catch (error: unknown) {
    console.error('Failed to delete item:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
