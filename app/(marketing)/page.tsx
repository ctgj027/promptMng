import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        PromptManager
      </h1>
      <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
        A collaborative prompt knowledge base built on top of GitHub. Browse, search, and propose
        improvements through pull requests with ease.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/prompts"
          className="rounded-md bg-neutral-900 px-4 py-2 text-white shadow hover:bg-neutral-700"
        >
          Enter app
        </Link>
        <Link
          href="https://github.com"
          className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          View repository
        </Link>
      </div>
    </main>
  );
}
