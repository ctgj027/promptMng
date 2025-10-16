import PromptWorkspace from '@/components/PromptWorkspace';
import { fetchPrompts } from '@/lib/github';

export const dynamic = 'force-dynamic';

export default async function PromptsPage() {
  const { items } = await fetchPrompts({ page: 1, perPage: 50 });

  return <PromptWorkspace prompts={items} />;
}
