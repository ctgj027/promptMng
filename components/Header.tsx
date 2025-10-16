'use client';

import { useTransition } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/lib/i18n';

type HeaderProps = {
  query: string;
  onQueryChange(value: string): void;
  onCreate?(): void;
};

export default function Header({ query, onQueryChange, onCreate }: HeaderProps) {
  const { data: session } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const [isPending, startTransition] = useTransition();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-1 items-center gap-3">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
        />
        {onCreate && session?.user && (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {t('createPrompt')}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value as 'en' | 'zh')}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
        <button
          type="button"
          onClick={() => setTheme((resolvedTheme ?? 'light') === 'light' ? 'dark' : 'light')}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700"
        >
          {(resolvedTheme ?? 'light') === 'light' ? t('dark') : t('light')}
        </button>
        {session ? (
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
            onClick={() => startTransition(() => signOut())}
            disabled={isPending}
          >
            {t('logout')}
          </button>
        ) : (
          <button
            type="button"
            className="rounded-md border border-neutral-900 bg-neutral-900 px-3 py-1 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900"
            onClick={() => startTransition(() => signIn('github'))}
            disabled={isPending}
          >
            {t('login')}
          </button>
        )}
      </div>
    </header>
  );
}
