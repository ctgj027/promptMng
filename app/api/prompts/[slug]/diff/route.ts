import { NextResponse } from 'next/server';
import { fetchDiff } from '@/lib/github';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get('base');
  const head = searchParams.get('head');
  if (!base || !head) {
    return NextResponse.json({ error: { code: 'invalid_payload', message: 'Missing base or head' } }, { status: 400 });
  }
  const diff = await fetchDiff({ slug: params.slug, base, head });
  return NextResponse.json({ diff }, { status: 200, headers: { 'Cache-Control': 's-maxage=30' } });
}
