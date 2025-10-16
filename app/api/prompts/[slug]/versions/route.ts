import { NextResponse } from 'next/server';
import { listVersions } from '@/lib/github';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const versions = await listVersions(params.slug);
  return NextResponse.json({ versions }, { status: 200, headers: { 'Cache-Control': 's-maxage=60' } });
}
