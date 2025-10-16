import MiniSearch from 'mini-search';
import { Prompt } from './types';

export type SearchIndex = MiniSearch<Prompt>;

export function createSearchIndex(prompts: Prompt[]) {
  const index = new MiniSearch<Prompt>({
    fields: ['meta.title', 'meta.tags', 'content'],
    storeFields: ['slug', 'meta', 'content'],
    idField: 'slug',
    extractField: (document, fieldName) =>
      fieldName.split('.').reduce<any>((doc, key) => (doc ? doc[key as keyof typeof doc] : undefined), document),
    searchOptions: {
      boost: { 'meta.title': 2 }
    }
  });
  index.addAll(prompts);
  return index;
}

export function searchPrompts(index: SearchIndex, query: string) {
  if (!query) return [];
  return index.search(query, { prefix: true });
}
