'use client';

import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

export type SidebarProps = {
  tags: string[];
  selectedTags: string[];
  onToggleTag(tag: string): void;
  onSelectView(view: 'all' | 'favorites' | 'recent'): void;
  view: 'all' | 'favorites' | 'recent';
};

export default function Sidebar({ tags, selectedTags, onToggleTag, onSelectView, view }: SidebarProps) {
  const { t } = useI18n();
  const tagCounts = useMemo(() => tags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {}), [tags]);

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('prompts')}</h3>
        <nav className="mt-2 flex flex-col gap-2 text-sm">
          <button
            type="button"
            className={`rounded-md px-2 py-1 text-left ${view === 'all' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            onClick={() => onSelectView('all')}
          >
            {t('all')}
          </button>
          <button
            type="button"
            className={`rounded-md px-2 py-1 text-left ${view === 'favorites' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            onClick={() => onSelectView('favorites')}
          >
            {t('favorites')}
          </button>
          <button
            type="button"
            className={`rounded-md px-2 py-1 text-left ${view === 'recent' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            onClick={() => onSelectView('recent')}
          >
            {t('recent')}
          </button>
        </nav>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t('tags')}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(tagCounts).map(([tag, count]) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs ${isActive ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900' : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}
              >
                {tag} <span className="ml-1 text-[10px] text-neutral-500">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
