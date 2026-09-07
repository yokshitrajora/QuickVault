import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrlMetadata } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const metadata = await scrapeUrlMetadata(url);
    return NextResponse.json(metadata);
  } catch (error: unknown) {
    console.error('Metadata API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract metadata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
