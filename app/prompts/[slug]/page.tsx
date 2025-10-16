import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import PromptVersionPanel from '@/components/PromptVersionPanel';
import { fetchPrompt, listVersions } from '@/lib/github';

export default async function PromptDetailPage({ params }: { params: { slug: string } }) {
  const prompt = await fetchPrompt(params.slug);
  if (!prompt) return notFound();
  const versions = await listVersions(params.slug);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">{prompt.meta.title}</h1>
        <p className="text-sm text-neutral-500">
          {prompt.meta.author} — {new Date(prompt.meta.updatedAt).toLocaleString()}
        </p>
        <div className="flex flex-wrap gap-2">
          {prompt.meta.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-200">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <section className="prose max-w-none dark:prose-invert">
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>{prompt.content}</ReactMarkdown>
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Versions</h2>
        <PromptVersionPanel slug={prompt.slug} versions={versions} />
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Model hints</h2>
        <pre className="overflow-x-auto rounded-md bg-neutral-100 p-4 text-xs dark:bg-neutral-800">
          <code>{JSON.stringify(prompt.meta.modelHints, null, 2)}</code>
        </pre>
      </section>
    </div>
  );
}
