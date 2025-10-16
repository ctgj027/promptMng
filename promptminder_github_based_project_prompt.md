# ✅ 一体化任务提示词（Master Prompt）

**你的身份与目标**  
你是一名资深全栈工程师兼产品设计师。请产出一个可运行的 Web 应用项目，UI 参考 promptMinder 的信息架构与交互风格（侧边栏分组/标签、主区列表与详情、版本切换与对比、简洁现代的卡片与表单），但**不要复刻其代码**。  
**硬性约束：严禁使用 Clerk 和 Supabase。**  
Prompt 数据**全部托管在 GitHub 仓库**，通过 GitHub API 读写；新建/更新通过 PR 流程实现版本化；应用支持只读模式与“提交更改→自动创建分支+PR”的协作模式。

---

## 一、总体要求

1. **技术栈**
   - 前端：Next.js 14（App Router）、React、TypeScript、Tailwind CSS（或 shadcn/ui 组件库）。
   - 认证：NextAuth.js（GitHub OAuth 提供方），不得使用 Clerk。
   - 数据源：GitHub 仓库（Markdown/YAML/JSON 文件作为单条 Prompt 与元数据的存储载体）。
   - 服务端：Next.js Route Handlers + Edge/Node runtime（注明各自使用场景）。
   - 打包与部署：支持 Vercel 一键部署；同时提供 Dockerfile。
   - 测试：Vitest + Playwright（端到端覆盖关键流程）。

2. **UI 指南（对标 promptMinder 的信息架构）**
   - 左侧：工作区/团队（可选）、收藏视图、标签/分类、搜索栏。
   - 中间主区：Prompt 列表（标题、标签、更新时间、作者）、分页/无限滚动。
   - 右或弹窗：Prompt 详情与版本切换；支持 Diff 视图（展示两版本文本差异）。
   - 主题：浅色/深色、响应式布局、键盘快捷键（搜索、创建、保存）。
   - i18n：至少支持中/英文切换。

3. **Prompt 数据模型（以文件为中心）**
   - 目录结构（仓库内）：
     ```
     /prompts/
       <slug>/
         prompt.md            # 正文（必填）
         meta.yaml            # 元数据：title, tags[], createdAt, updatedAt, author, language, useCases[], modelHints{temperature, top_p, ...}
         changelog.md         #（可选）补充说明
     ```
   - 也允许单文件模式（`<slug>.md` + YAML Frontmatter）。
   - 标签、作者、时间戳在 `meta.yaml`；提交历史来自 Git 历史/PR 描述。

4. **GitHub 集成规范**
   - 只读拉取：使用 GitHub REST 或 GraphQL API 读取 `prompts/` 目录，支持缓存（ETag/If-None-Match）。
   - 创建/更新：
     - 本地表单 → 服务端创建分支（命名约定：`feature/prompt/<slug>-<timestamp>`） → 新提交 → 自动发起 PR（标题含变更摘要，PR body 包含 diff 预览与预览链接）。
   - 版本对比：调用 GitHub 比较 API（`/compare/:base...:head`）展示 md 文本差异。
   - 访问控制：未登录用户只读；登录用户根据仓库权限决定是否显示“提交更改”。

5. **安全与配额**
   - 环境变量：`GITHUB_APP_ID`（如用 GitHub App）、`GITHUB_OAUTH_CLIENT_ID/SECRET`、`GITHUB_REPO`, `GITHUB_INSTALLATION_ID`（App 模式时）、`NEXTAUTH_SECRET`。
   - 速率限制：对 API 路由加入简单令牌桶/节流；本地缓存 60s；错误时优雅降级（回退只读、提示稍后重试）。
   - 不在客户端暴露写入 Token；写操作全部走服务端。

---

## 二、功能清单（必须实现）

1. **首页与导航**
   - 顶部：搜索框（标题/标签/内容全文检索，先客户端索引，后期可接入 MiniSearch/Fuse）。
   - 左侧：标签列表（来自 meta.yaml）、「全部」「我的收藏」「最近更新」。
   - 右上角：登录/头像/语言切换/主题切换。

2. **Prompt 列表页**
   - 卡片项：标题、标签、更新时间、作者、文件路径。
   - 排序：按更新时间/名称；筛选：标签多选。
   - 快捷操作：收藏、复制到剪贴板、打开详情。

3. **详情页**
   - 显示 `prompt.md` 渲染（Markdown），`meta.yaml` 的元数据 Chips。
   - “版本”下拉：列出来自仓库历史/PR 的版本节点；点击对比：展示左右/行内 Diff。
   - “应用参数”区：modelHints 表单（temperature、top_p 等），支持一键复制 JSON。

4. **创建/编辑（登录+有权限）**
   - 表单：标题（唯一性校验生成 slug）、标签、语言、useCases、modelHints、正文（Markdown 编辑器，支持快捷插入占位符变量如 `{{name}}`）。
   - 提交：在服务端创建分支 → 写入/更新文件 → 创建 PR；成功后显示 PR 链接。
   - 编辑现有 Prompt：拉取当前版本到表单，提交同样走 PR 流。

5. **收藏与本地偏好**
   - 收藏列表存本地（LocalStorage）+ 登录用户可选写到用户 config 文件（`/users/<github_login>.json`）通过 PR 同步。

6. **多语言与无障碍**
   - 使用 `next-intl` 或同类；组件加 aria-label、焦点态，满足基本 a11y。

---

## 三、API 设计（Next.js Route Handlers）

- `GET /api/prompts`: 查询参数 `q`（搜索）、`tag`、`page`、`per_page`；返回归一化后的集合（合并 md 与 meta）。
- `GET /api/prompts/:slug`: 读取某个 Prompt（最新）。
- `GET /api/prompts/:slug/versions`: 返回 Git 历史（提交/PR 视图）。
- `GET /api/prompts/:slug/diff?base=…&head=…`: 返回两版本 Markdown diff（统一到前端渲染）。
- `POST /api/prompts`（鉴权必需）：创建分支→写文件→开 PR。
- `PUT /api/prompts/:slug`（鉴权必需）：同上。
- 统一错误模型：`{ error: { code, message, details? } }`。

**实现要点**  
- 封装 GitHub 客户端模块：`/lib/github.ts`（读写、缓存、错误分类、速率处理）。
- 生成 PR 内容：自动在 body 中包含变更摘要、元数据表、预览链接（指向部署站点的 `/preview?pr=<id>`）。
- Diff：服务端用 `diff` 库或 GitHub API，返回 unified 格式，前端用高亮组件渲染。

---

## 四、文件与代码结构（请直接输出完整骨架）

```
/app
  /(marketing)/page.tsx
  /prompts/page.tsx
  /prompts/[slug]/page.tsx
  /api/prompts/route.ts
  /api/prompts/[slug]/route.ts
  /api/prompts/[slug]/versions/route.ts
  /api/prompts/[slug]/diff/route.ts
/components
  PromptCard.tsx
  PromptEditor.tsx
  PromptDiff.tsx
  Sidebar.tsx
  Header.tsx
/lib
  github.ts
  search.ts
  auth.ts
/styles
  globals.css
/tests
  e2e/...
  unit/...
/scripts
  seed.ts
.env.example
dockerfile
README.md
```

**请产出：**
1. 所有关键文件的**完整代码**（不是伪代码）：包括 NextAuth 配置、GitHub API 调用、页面组件、API 路由、类型定义、样式示例。
2. `README.md`：配置与部署指南（Vercel、Docker）、需要的 GitHub 权限（repo:read、pull_request:write、contents:write 等）、环境变量说明、初始仓库结构、Demo 截图说明（占位）。
3. `tests/`：至少 1 个 Vitest 单元测试（解析 meta）、1 个 Playwright e2e（创建 Prompt→看到 PR 链接）的示例。
4. `scripts/seed.ts`：生成示例 `prompts/` 目录与 meta 文件的脚本。
5. 简要说明如何改造为 GitHub App 模式（安装到组织、使用 Installation Token）。

---

## 五、验收标准（Acceptance Criteria）

- 不使用 Clerk 和 Supabase。
- 未登录时可浏览与搜索；登录后可发起创建/修改 → 生成新的分支与 PR，并能在界面中看到对应 PR 链接。
- 列表、搜索、标签筛选、详情、版本列表、Diff 视图、复制按钮、收藏与主题切换正常工作。
- 能在 Vercel 上零配置部署（仅设置环境变量）。
- 在配额受限或失败时，有清晰的错误提示与只读降级。

---

## 六、可选增强（如时间允许再实现）

- Webhooks：合并 PR 后触发 ISR revalidate，自动刷新站点。
- 角色与权限：仅仓库 Collaborators 显示写入按钮。
- 临时草稿：在浏览器 IndexedDB 保存编辑草稿。
- 变量预览：在详情页提供“填参预览并复制”。

---

请严格按以上规范输出项目代码骨架与说明文档，确保拿到结果后可直接创建仓库、设置环境变量并部署运行。
