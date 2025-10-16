import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchPrompts, writePrompt, parseMeta } from '@/lib/github';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const perPage = Number(searchParams.get('per_page') ?? '20');
  const tag = searchParams.getAll('tag');
  const q = searchParams.get('q') ?? undefined;

  const data = await fetchPrompts({ page, perPage, tag: tag.length ? tag : undefined, q });
  return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 's-maxage=60' } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });
  }

  const identifier = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const limited = rateLimit(identifier);
  if (!limited.success) {
    return NextResponse.json(
      { error: { code: 'rate_limited', message: 'Too many requests', details: { retryAfter: limited.retryAfter } } },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  const body = await request.json();
  const slugFromPayload = body.slug ?? body.meta?.slug ?? body.meta?.title ?? '';
  const normalizedSlug = String(slugFromPayload)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const meta = parseMeta(body.meta ? body.meta : '', normalizedSlug);
  const content = body.content ?? '';
  if (!meta.slug || !content) {
    return NextResponse.json({ error: { code: 'invalid_payload', message: 'Missing slug or content' } }, { status: 400 });
  }

  const branch = `feature/prompt/${meta.slug}-${Date.now()}`;
  try {
    const prUrl = await writePrompt({
      slug: meta.slug,
      meta: { ...meta, updatedAt: new Date().toISOString(), author: session.user.name ?? 'anonymous' },
      content,
      branch,
      author: session.user.name ?? 'anonymous'
    });
    return NextResponse.json({ prUrl }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'github_error', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    );
  }
}
