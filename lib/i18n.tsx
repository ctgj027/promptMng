'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';

type Locale = 'en' | 'zh';

type Messages = Record<string, string>;

type Dictionary = Record<Locale, Messages>;

const translations: Dictionary = {
  en: {
    searchPlaceholder: 'Search prompts…',
    login: 'Sign in',
    logout: 'Sign out',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    prompts: 'Prompts',
    favorites: 'Favorites',
    all: 'All',
    recent: 'Recently updated',
    tags: 'Tags',
    empty: 'No prompts found matching your filters.',
    createPrompt: 'Create prompt',
    copy: 'Copy',
    copied: 'Copied!',
    details: 'View details'
  },
  zh: {
    searchPlaceholder: '搜索提示词…',
    login: '登录',
    logout: '退出',
    language: '语言',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    prompts: '提示词',
    favorites: '收藏',
    all: '全部',
    recent: '最近更新',
    tags: '标签',
    empty: '没有符合条件的提示词。',
    createPrompt: '创建提示词',
    copy: '复制',
    copied: '已复制！',
    details: '查看详情'
  }
};

type I18nContextValue = {
  locale: Locale;
  setLocale(locale: Locale): void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem('pm:locale');
    if (stored === 'en' || stored === 'zh') {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('pm:locale', locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale
  }), [locale]);

  return (
    <I18nContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={translations[locale]}>{children}</NextIntlClientProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  const t = useTranslations();
  return { ...ctx, t } as const;
}
