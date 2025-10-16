import { describe, expect, it } from 'vitest';
import { parseMeta } from '@/lib/github';

const sample = `title: Greeting
slug: greeting
language: en
tags:
  - welcome
  - onboarding
useCases:
  - email
  - support
modelHints:
  temperature: 0.2
  top_p: 0.9
`;

describe('parseMeta', () => {
  it('parses yaml into meta object', () => {
    const meta = parseMeta(sample, 'greeting');
    expect(meta.title).toBe('Greeting');
    expect(meta.tags).toContain('welcome');
    expect(meta.modelHints.temperature).toBe(0.2);
  });

  it('falls back to defaults for invalid yaml', () => {
    const meta = parseMeta(':::', 'fallback');
    expect(meta.slug).toBe('fallback');
    expect(meta.tags).toEqual([]);
  });
});
