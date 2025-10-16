import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchPrompt, parseMeta, writePrompt } from '@/lib/github';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const prompt = await fetchPrompt(params.slug);
  if (!prompt) {
    return NextResponse.json({ error: { code: 'not_found', message: 'Prompt not found' } }, { status: 404 });
  }
  return NextResponse.json(prompt, { status: 200, headers: { 'Cache-Control': 's-maxage=60' } });
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
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
  const meta = parseMeta(body.meta ? body.meta : '', params.slug);
  const content = body.content ?? '';
  if (!content) {
    return NextResponse.json({ error: { code: 'invalid_payload', message: 'Missing content' } }, { status: 400 });
  }

  const branch = `feature/prompt/${params.slug}-${Date.now()}`;
  try {
    const prUrl = await writePrompt({
      slug: params.slug,
      meta: { ...meta, updatedAt: new Date().toISOString(), author: session.user.name ?? meta.author },
      content,
      branch,
      author: session.user.name ?? 'anonymous'
    });
    return NextResponse.json({ prUrl }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: { code: 'github_error', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    );
  }
}
