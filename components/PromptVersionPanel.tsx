'use client';

import { useState } from 'react';
import PromptDiff from './PromptDiff';

export type PromptVersion = {
  sha: string;
  author: string;
  message: string;
  date: string;
};

type Props = {
  slug: string;
  versions: PromptVersion[];
};

export default function PromptVersionPanel({ slug, versions }: Props) {
  const [base, setBase] = useState(versions[1]?.sha ?? versions[0]?.sha ?? '');
  const [head, setHead] = useState(versions[0]?.sha ?? '');

  if (!versions.length) {
    return <p className="text-sm text-neutral-500">No versions available.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col text-xs">
          <span>Base</span>
          <select
            value={base}
            onChange={(event) => setBase(event.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {versions.map((version) => (
              <option key={version.sha} value={version.sha}>
                {version.sha.slice(0, 7)} — {version.author}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs">
          <span>Head</span>
          <select
            value={head}
            onChange={(event) => setHead(event.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {versions.map((version) => (
              <option key={version.sha} value={version.sha}>
                {version.sha.slice(0, 7)} — {version.author}
              </option>
            ))}
          </select>
        </label>
      </div>
      {base && head ? <PromptDiff slug={slug} base={base} head={head} /> : null}
    </div>
  );
}
