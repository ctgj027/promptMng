'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PromptMeta } from '@/lib/types';

export type PromptEditorProps = {
  defaultValues?: Partial<PromptMeta> & { content?: string };
  onSubmit(values: PromptMeta & { content: string }): Promise<void>;
  isSubmitting?: boolean;
};

type PromptEditorForm = Omit<PromptMeta, 'tags' | 'useCases' | 'modelHints'> & {
  tags: string;
  useCases: string;
  modelHints: string;
  content: string;
};

const defaultModelHints = {
  temperature: 0.7,
  top_p: 0.9
};

export default function PromptEditor({ defaultValues, onSubmit, isSubmitting }: PromptEditorProps) {
  const { register, handleSubmit, formState } = useForm<PromptEditorForm>({
    defaultValues: {
      title: defaultValues?.title ?? '',
      slug: defaultValues?.slug ?? '',
      tags: (defaultValues?.tags ?? []).join(', '),
      createdAt: defaultValues?.createdAt ?? new Date().toISOString(),
      updatedAt: defaultValues?.updatedAt ?? new Date().toISOString(),
      author: defaultValues?.author ?? '',
      language: defaultValues?.language ?? 'en',
      useCases: (defaultValues?.useCases ?? []).join(', '),
      modelHints: JSON.stringify(defaultValues?.modelHints ?? defaultModelHints, null, 2),
      description: defaultValues?.description,
      content: defaultValues?.content ?? ''
    }
  });

  const submit = handleSubmit(async (values) => {
    let modelHints: Record<string, number | string | boolean> = values.modelHints as never;
    if (typeof values.modelHints === 'string') {
      try {
        const parsed = JSON.parse(values.modelHints) as Record<string, number | string | boolean>;
        modelHints = parsed;
      } catch (error) {
        throw new Error('Invalid JSON for model hints');
      }
    }

    const formatted: PromptMeta & { content: string } = {
      ...values,
      tags: Array.isArray(values.tags)
        ? values.tags
        : values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
      useCases: Array.isArray(values.useCases)
        ? values.useCases
        : values.useCases
            .split(',')
            .map((useCase) => useCase.trim())
            .filter(Boolean),
      modelHints,
      content: values.content
    };
    try {
      await onSubmit(formatted);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit prompt';
      toast.error(message);
      throw error;
    }
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <input type="hidden" {...register('createdAt')} />
      <input type="hidden" {...register('updatedAt')} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Title</span>
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            {...register('title', { required: true })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Slug</span>
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            {...register('slug', { required: true })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span>Tags (comma separated)</span>
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            {...register('tags')}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span>Description</span>
          <textarea
            rows={3}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            {...register('description')}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span>Use cases (comma separated)</span>
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            {...register('useCases')}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Language</span>
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            {...register('language')}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Author</span>
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            {...register('author')}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span>Model hints (JSON)</span>
          <textarea
            rows={4}
            className="rounded-md border border-neutral-300 px-3 py-2 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-800"
            {...register('modelHints')}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span>Prompt body</span>
        <textarea
          rows={12}
          className="rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800"
          {...register('content', { required: true })}
        />
      </label>
      <button
        type="submit"
        disabled={formState.isSubmitting || isSubmitting}
        className="self-end rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {formState.isSubmitting || isSubmitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
