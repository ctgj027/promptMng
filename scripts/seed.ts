import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const root = process.cwd();
const promptsDir = join(root, 'prompts');
const slug = 'welcome-message';
const promptDir = join(promptsDir, slug);

mkdirSync(promptDir, { recursive: true });

const meta = {
  title: 'Welcome message',
  slug,
  tags: ['greeting', 'onboarding'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: 'system',
  language: 'en',
  useCases: ['Support reply', 'Marketing email'],
  modelHints: {
    temperature: 0.4,
    top_p: 0.9
  },
  description: 'Friendly welcome message for new users.'
};

writeFileSync(join(promptDir, 'meta.yaml'), yaml.dump(meta));
writeFileSync(
  join(promptDir, 'prompt.md'),
  `# Welcome to PromptManager\n\nThank you for joining our community! Let us know how we can help.`
);

console.log(`Seeded example prompt at ${promptDir}`);
