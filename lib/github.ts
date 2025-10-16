import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';
import { GithubFile, Prompt, PromptListResponse, PromptMeta } from './types';

const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_DEFAULT_BRANCH = 'main' } = process.env;

if (!GITHUB_REPO) {
  console.warn('[github] Missing GITHUB_REPO environment variable. API routes will fail.');
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

const [owner, repo] = (GITHUB_REPO ?? '/').split('/');

export function getOctokit() {
  return octokit;
}

type FileEntry = {
  path: string;
  type: string;
  sha: string;
};

type CacheEntry<T> = { value: T; expiresAt: number };

const CACHE_TTL = 60_000;
const directoryCache = new Map<string, CacheEntry<FileEntry[]>>();
const fileCache = new Map<string, CacheEntry<GithubFile | null>>();
const promptCache = new Map<string, CacheEntry<Prompt | null>>();
const promptListCache = new Map<string, CacheEntry<PromptListResponse>>();

function getFromCache<T>(store: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function setCache<T>(store: Map<string, CacheEntry<T>>, key: string, value: T, ttl = CACHE_TTL) {
  store.set(key, { value, expiresAt: Date.now() + ttl });
}

export function clearGithubCache() {
  directoryCache.clear();
  fileCache.clear();
  promptCache.clear();
  promptListCache.clear();
}

export async function listPromptFiles() {
  if (!owner || !repo) return [];
  const cacheKey = `${owner}/${repo}:directories`;
  const cached = getFromCache(directoryCache, cacheKey);
  if (cached) return cached;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'prompts'
    });
    if (!Array.isArray(data)) return [];
    const directories = data.filter((item): item is FileEntry => item.type === 'dir') as FileEntry[];
    setCache(directoryCache, cacheKey, directories);
    return directories;
  } catch (error) {
    console.error('[github] Failed to list prompts directory', error);
    return [];
  }
}

export async function fetchPrompt(slug: string): Promise<Prompt | null> {
  if (!owner || !repo) return null;
  const cacheKey = `${owner}/${repo}:prompt:${slug}`;
  const cached = getFromCache(promptCache, cacheKey);
  if (cached) return cached;

  const basePath = `prompts/${slug}`;
  const [metaFile, promptFile] = await Promise.all([
    readFile(`${basePath}/meta.yaml`),
    readFile(`${basePath}/prompt.md`)
  ]);
  if (!promptFile) return null;
  const metaSource = metaFile?.content ? Buffer.from(metaFile.content, 'base64').toString('utf8') : '';
  const meta = parseMeta(metaSource, slug);
  const prompt: Prompt = {
    slug,
    path: basePath,
    meta,
    content: Buffer.from(promptFile.content ?? '', 'base64').toString('utf8')
  };
  setCache(promptCache, cacheKey, prompt);
  return prompt;
}

export async function fetchPrompts({
  page = 1,
  perPage = 20,
  tag,
  q
}: {
  page?: number;
  perPage?: number;
  tag?: string | string[];
  q?: string;
}): Promise<PromptListResponse> {
  const cacheKey = JSON.stringify({ page, perPage, tag: tag ?? null, q: q ?? null });
  const cached = getFromCache(promptListCache, cacheKey);
  if (cached) return cached;

  const directories = await listPromptFiles();
  const slugs = directories.map((dir) => dir.path.split('/').pop()!).filter(Boolean);
  const prompts = await Promise.all(slugs.map((slug) => fetchPrompt(slug)));
  let items = prompts.filter((p): p is Prompt => Boolean(p));

  if (tag) {
    const tags = Array.isArray(tag) ? tag : [tag];
    items = items.filter((prompt) => tags.every((t) => prompt.meta.tags.includes(t)));
  }

  if (q) {
    const query = q.toLowerCase();
    items = items.filter((item) =>
      [
        item.meta.title,
        item.meta.tags.join(' '),
        item.content,
        item.meta.useCases.join(' ')
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  const total = items.length;
  const start = (page - 1) * perPage;
  const paginated = items.slice(start, start + perPage);

  const response: PromptListResponse = {
    items: paginated,
    total,
    page,
    perPage
  };
  setCache(promptListCache, cacheKey, response);
  return response;
}

export async function readFile(path: string, ref = GITHUB_DEFAULT_BRANCH): Promise<GithubFile | null> {
  if (!owner || !repo) return null;
  const cacheKey = `${owner}/${repo}:${ref}:${path}`;
  const cached = getFromCache(fileCache, cacheKey);
  if (cached) return cached;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
    if ('content' in data) {
      const file = { path: data.path, sha: data.sha, content: data.content };
      setCache(fileCache, cacheKey, file);
      return file;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function writePrompt({
  slug,
  meta,
  content,
  branch,
  author
}: {
  slug: string;
  meta: PromptMeta;
  content: string;
  branch: string;
  author: string;
}) {
  if (!owner || !repo) throw new Error('GITHUB_REPO is not configured.');
  const basePath = `prompts/${slug}`;
  await ensureBranch(branch);
  await Promise.all([
    createOrUpdateFile({
      path: `${basePath}/prompt.md`,
      content,
      branch,
      message: `chore: update prompt ${slug}`,
      author
    }),
    createOrUpdateFile({
      path: `${basePath}/meta.yaml`,
      content: yaml.dump(meta, { lineWidth: 120 }),
      branch,
      message: `chore: update meta ${slug}`,
      author
    })
  ]);
  const pr = await octokit.pulls.create({
    owner,
    repo,
    head: branch,
    base: GITHUB_DEFAULT_BRANCH,
    title: `feat(prompt): ${meta.title}`,
    body: `This PR updates prompt **${meta.title}**.\n\n- Tags: ${meta.tags.join(', ')}\n- Language: ${meta.language}`
  });
  clearGithubCache();
  return pr.data.html_url;
}

async function ensureBranch(branch: string) {
  try {
    await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
  } catch (error) {
    const { data } = await octokit.git.getRef({ owner, repo, ref: `heads/${GITHUB_DEFAULT_BRANCH}` });
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: data.object.sha });
  }
}

async function createOrUpdateFile({
  path,
  content,
  branch,
  message,
  author
}: {
  path: string;
  content: string;
  branch: string;
  message: string;
  author: string;
}) {
  const existing = await readFile(path, branch);
  const encoded = Buffer.from(content).toString('base64');
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: encoded,
    branch,
    committer: { name: author, email: `${author}@users.noreply.github.com` },
    author: { name: author, email: `${author}@users.noreply.github.com` },
    sha: existing?.sha
  });
}

export async function listVersions(slug: string) {
  if (!owner || !repo) return [];
  const path = `prompts/${slug}/prompt.md`;
  const { data } = await octokit.repos.listCommits({ owner, repo, path, per_page: 20 });
  return data.map((commit) => ({
    sha: commit.sha,
    author: commit.commit.author?.name ?? 'Unknown',
    message: commit.commit.message,
    date: commit.commit.author?.date ?? ''
  }));
}

export async function fetchDiff({ slug, base, head }: { slug: string; base: string; head: string }) {
  if (!owner || !repo) return '';
  const { data } = await octokit.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${base}...${head}`
  });
  const filePath = `prompts/${slug}/prompt.md`;
  const targetFile = data.files?.find((file) => file.filename === filePath);
  return targetFile?.patch ?? '';
}

export function parseMeta(raw: string | Record<string, unknown>, slug: string): PromptMeta {
  try {
    const parsed = typeof raw === 'string' ? (yaml.load(raw) as Partial<PromptMeta>) : (raw as Partial<PromptMeta>);
    const data = parsed ?? {};
    return {
      title: data.title ?? slug,
      slug,
      tags: Array.isArray(data.tags)
        ? (data.tags as unknown[])
            .map((tag) => String(tag))
            .map((tag) => tag.trim())
            .filter(Boolean)
        : typeof data.tags === 'string'
          ? data.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
      author: data.author ?? 'unknown',
      language: data.language ?? 'en',
      useCases: Array.isArray(data.useCases)
        ? (data.useCases as unknown[])
            .map((value) => String(value))
            .map((value) => value.trim())
            .filter(Boolean)
        : typeof data.useCases === 'string'
          ? data.useCases
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
          : [],
      modelHints:
        typeof data.modelHints === 'object' && data.modelHints !== null
          ? (data.modelHints as Record<string, number | string | boolean>)
          : {},
      description: data.description
    };
  } catch (error) {
    return {
      title: slug,
      slug,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'unknown',
      language: 'en',
      useCases: [],
      modelHints: {}
    };
  }
}
