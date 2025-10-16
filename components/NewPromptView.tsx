'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import PromptEditor from './PromptEditor';
import { PromptMeta } from '@/lib/types';

export default function NewPromptView() {
  const [submitting, setSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  const handleSubmit = async (values: PromptMeta & { content: string }) => {
    setSubmitting(true);
    try {
      const { content, ...meta } = values;
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta, content })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message ?? 'Failed to create prompt');
      }
      const data = await response.json();
      setPrUrl(data.prUrl);
      toast.success('Pull request created');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create prompt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PromptEditor onSubmit={handleSubmit} isSubmitting={submitting} />
      {prUrl ? (
        <p className="text-sm text-neutral-600">
          Pull request: <a href={prUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">{prUrl}</a>
        </p>
      ) : null}
    </div>
  );
}
