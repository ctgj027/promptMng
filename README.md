# PromptManager

PromptManager 是一个基于 GitHub 存储提示词的 Next.js 14 应用骨架。它遵循 promptMinder 的信息架构，支持浏览、搜索、收藏和通过 PR 协作编辑 Prompt。

## ✨ 功能特性

- 🔐 GitHub OAuth + NextAuth 认证（未登录只读，登录后可提交 PR）
- 📂 GitHub 仓库中以目录组织 Prompt（`prompt.md` + `meta.yaml`）
- 🔍 列表搜索、标签筛选、收藏、本地化（中/英）与主题切换
- 📝 Prompt 详情页支持 Markdown 渲染、版本列表与 Diff 视图
- 🛠️ 创建/编辑通过服务端写分支并自动创建 Pull Request
- 🚦 内置速率限制、错误提示、只读降级处理
- 🧪 Vitest 单测与 Playwright E2E 流程示例
- 🚀 支持 Vercel 部署与 Docker 容器化

## 📁 项目结构

```
/app
  /(marketing)/page.tsx           # 营销页
  /prompts/page.tsx               # Prompt 列表
  /prompts/[slug]/page.tsx        # Prompt 详情
  /api/prompts/...                # 统一 API 路由
/components                      # UI 组件
/lib                              # GitHub、认证、搜索等工具函数
/styles/globals.css               # Tailwind 全局样式
/tests                            # Vitest + Playwright 示例
/scripts/seed.ts                  # 生成示例数据
```

## 🚀 快速开始

1. 安装依赖

   ```bash
   pnpm install
   # or npm install / yarn install
   ```

2. 配置环境变量（参考 `.env.example`）

   ```env
   GITHUB_TOKEN=ghp_xxx                # 服务器端访问 token（repo:read, contents:write, pull_requests:write）
   GITHUB_REPO=owner/repo              # 存放 prompts/ 的仓库
   GITHUB_DEFAULT_BRANCH=main
   GITHUB_OAUTH_CLIENT_ID=xxx          # GitHub OAuth App
   GITHUB_OAUTH_CLIENT_SECRET=xxx
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=PromptManager
   ```

3. 运行开发环境

   ```bash
   pnpm dev
   ```

4. 生成示例数据（可选）

   ```bash
   pnpm dlx tsx scripts/seed.ts
   ```

5. 运行测试

   ```bash
   pnpm test        # Vitest
   pnpm test:e2e    # Playwright
   ```

## 🐳 Docker

```bash
docker build -t promptmanager .
docker run -p 3000:3000 --env-file .env promptmanager
```

## ▲ Vercel 部署

- 关联仓库后，在 Vercel 项目设置中填写上述环境变量即可零配置部署。
- 建议将 `GITHUB_TOKEN` 替换为 GitHub App Installation Token（见下）。

## 🔐 GitHub 权限说明

- `repo:read`：读取 `prompts/` 目录内容
- `contents:write`：向分支提交文件
- `pull_requests:write`：创建 PR
- （可选）`workflow`：如需触发 CI

## 🧩 GitHub App 模式改造

1. 在 GitHub 创建 GitHub App，启用 `Contents`（Read/Write）和 `Pull requests`（Read/Write）权限。
2. 安装到目标组织或仓库，记录 `GITHUB_APP_ID` 与 `GITHUB_INSTALLATION_ID`。
3. 在服务端使用 Installation Token：

   ```ts
   import { createAppAuth } from '@octokit/auth-app';

   const octokit = new Octokit({
     authStrategy: createAppAuth,
     auth: {
       appId: process.env.GITHUB_APP_ID!,
       installationId: process.env.GITHUB_INSTALLATION_ID!,
       privateKey: process.env.GITHUB_PRIVATE_KEY!
     }
   });
   ```

4. 将 `writePrompt` 等写操作替换为使用上述 `octokit` 实例，即可按安装仓库权限执行提交和 PR。

## 🧪 测试说明

- `tests/unit/meta-parser.test.ts`：验证 YAML 元数据解析
- `tests/e2e/create-prompt.spec.ts`：演示登录后创建 Prompt 并看到 PR 链接

## 🖼️ 截图（占位）

- `docs/screenshots/dashboard.png`
- `docs/screenshots/detail.png`

欢迎在此基础上继续扩展工作区、收藏同步、Webhook 自动刷新等高级功能！
