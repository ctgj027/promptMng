const requests = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(identifier: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const entry = requests.get(identifier);
  if (!entry || entry.expiresAt < now) {
    requests.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { success: true } as const;
  }
  if (entry.count >= limit) {
    return { success: false, retryAfter: Math.ceil((entry.expiresAt - now) / 1000) } as const;
  }
  entry.count += 1;
  return { success: true } as const;
}
