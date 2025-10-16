'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type PromptDiffProps = {
  slug: string;
  base: string;
  head: string;
};

export default function PromptDiff({ slug, base, head }: PromptDiffProps) {
  const [diff, setDiff] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiff() {
      setLoading(true);
      const response = await fetch(`/api/prompts/${slug}/diff?base=${base}&head=${head}`);
      if (!response.ok) {
        toast.error('Failed to load diff');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setDiff(data.diff);
      setLoading(false);
    }
    void loadDiff();
  }, [slug, base, head]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading diff…</p>;
  }

  return (
    <pre className="overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-900">
      <code>{diff}</code>
    </pre>
  );
}
