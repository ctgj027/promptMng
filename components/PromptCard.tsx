'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Prompt } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

export type PromptCardProps = {
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite(slug: string): void;
};

export default function PromptCard({ prompt, isFavorite, onToggleFavorite }: PromptCardProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const displayContent = useMemo(() => prompt.content.slice(0, 200), [prompt.content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    toast.success(t('copied'));
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{prompt.meta.title}</h3>
          <p className="text-xs text-neutral-500">{prompt.meta.author}</p>
        </div>
        <button
          type="button"
          aria-label="Favorite"
          onClick={() => onToggleFavorite(prompt.slug)}
          className={`rounded-full border px-2 py-1 text-xs ${isFavorite ? 'border-yellow-500 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20' : 'border-neutral-300 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'}`}
        >
          ★
        </button>
      </header>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">{displayContent}…</p>
      <div className="flex flex-wrap gap-2">
        {prompt.meta.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <footer className="flex items-center justify-between text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <time dateTime={prompt.meta.updatedAt}>
            {new Date(prompt.meta.updatedAt).toLocaleString()}
          </time>
          <span className="text-xs text-neutral-400">{prompt.path}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs font-medium text-neutral-600 hover:underline dark:text-neutral-300"
            onClick={handleCopy}
          >
            {copied ? t('copied') : t('copy')}
          </button>
          <Link href={`/prompts/${prompt.slug}`} className="text-xs font-medium text-neutral-900 hover:underline dark:text-neutral-100">
            {t('details')}
          </Link>
        </div>
      </footer>
    </article>
  );
}
