export type PromptMeta = {
  title: string;
  slug: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  language: string;
  useCases: string[];
  modelHints: Record<string, number | string | boolean>;
  description?: string;
};

export type Prompt = {
  slug: string;
  path: string;
  meta: PromptMeta;
  content: string;
};

export type PromptListResponse = {
  items: Prompt[];
  total: number;
  page: number;
  perPage: number;
};

export type GithubFile = {
  path: string;
  sha: string;
  content?: string;
};
