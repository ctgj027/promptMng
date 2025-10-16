'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptCard from './PromptCard';
import Sidebar from './Sidebar';
import Header from './Header';
import { Prompt } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { createSearchIndex, searchPrompts } from '@/lib/search';

export type PromptWorkspaceProps = {
  prompts: Prompt[];
};

type View = 'all' | 'favorites' | 'recent';

export default function PromptWorkspace({ prompts }: PromptWorkspaceProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [view, setView] = useState<View>('all');

  useEffect(() => {
    const storedFavorites = window.localStorage.getItem('pm:favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('pm:favorites', JSON.stringify(favorites));
  }, [favorites]);

  const allTags = useMemo(() => prompts.flatMap((prompt) => prompt.meta.tags), [prompts]);

  const searchIndex = useMemo(() => createSearchIndex(prompts), [prompts]);

  const filteredPrompts = useMemo(() => {
    const searchSet = new Set(
      query ? searchPrompts(searchIndex, query).map((result) => result.id as string) : prompts.map((prompt) => prompt.slug)
    );

    return prompts
      .filter((prompt) => searchSet.has(prompt.slug))
      .filter((prompt) => {
        if (selectedTags.length) {
          return selectedTags.every((tag) => prompt.meta.tags.includes(tag));
        }
        return true;
      })
      .filter((prompt) => {
        if (view === 'favorites') return favorites.includes(prompt.slug);
        if (view === 'recent') {
          const updated = new Date(prompt.meta.updatedAt).getTime();
          const week = 1000 * 60 * 60 * 24 * 7;
          return Date.now() - updated <= week;
        }
        return true;
      });
  }, [prompts, query, searchIndex, selectedTags, favorites, view]);

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onSelectView={(nextView) => setView(nextView)}
        view={view}
      />
      <main className="flex flex-1 flex-col">
        <Header query={query} onQueryChange={setQuery} onCreate={() => router.push('/prompts/new')} />
        <section className="grid flex-1 gap-4 bg-neutral-50 p-6 dark:bg-neutral-950 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrompts.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('empty')}</p>
          ) : (
            filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.slug}
                prompt={prompt}
                isFavorite={favorites.includes(prompt.slug)}
                onToggleFavorite={toggleFavorite}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
