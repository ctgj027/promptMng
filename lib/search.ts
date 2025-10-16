import { Prompt } from './types';

const normalize = (value: string) => value.normalize('NFKD').toLowerCase();

const promptText = (prompt: Prompt) =>
  normalize(
    [
      prompt.meta.title,
      prompt.meta.description ?? '',
      prompt.meta.tags.join(' '),
      prompt.meta.useCases.join(' '),
      prompt.content
    ].join(' ')
  );

export type SearchIndex = Map<string, { prompt: Prompt; text: string }>;

export function createSearchIndex(prompts: Prompt[]) {
  const entries = prompts.map((prompt) => [prompt.slug, { prompt, text: promptText(prompt) }] as const);
  return new Map(entries);
}

export function searchPrompts(index: SearchIndex, query: string) {
  const terms = query
    .trim()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  const normalizedTerms = terms.map((term) => normalize(term));

  return Array.from(index.values())
    .filter(({ text }) => normalizedTerms.every((term) => text.includes(term)))
    .map(({ prompt }) => prompt);
}
