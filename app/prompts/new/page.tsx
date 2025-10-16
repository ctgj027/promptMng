import { redirect } from 'next/navigation';
import NewPromptView from '@/components/NewPromptView';
import { auth } from '@/lib/auth';

export default async function NewPromptPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/prompts');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Create prompt</h1>
      <NewPromptView />
    </div>
  );
}
