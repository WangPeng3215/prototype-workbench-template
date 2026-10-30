# 项目结构说明

本文件描述 `prototype-workbench` 的真实结构。规范必须以此为准，不要按通用 Vue 项目模板假设存在 `router/`、`layouts/`、`config/`、测试或 CI。

## 1. 项目定位

- 单一原型 Hub：所有需求的页面原型集中在一个 Vue 前端项目中。
- 每个需求对应 `src/prototypes/` 下的一个一级目录，目录内包含多个页面和需求元数据。
- 本项目由只读公共模板仓库 Clone 初始化；本地 `.git` 仅用于识别模板来源，不向模板仓库提交、推送、建分支或 PR。个人原型不进入版本管理。
- 本项目不参与 superPM 运行时，不连接数据库；只有静态页面和本地 Mock 数据。
- 路径：默认 `workspace/prototype-workbench`，可由 superPM 配置覆盖；父仓库的 `.gitignore` 已忽略 `workspace/`。

## 2. 技术栈

| 类别 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Vue 3.5 | `<script setup lang="ts">` + Composition API |
| 语言 | TypeScript 6.0 | `vue-tsc -b` 参与构建，开启 `noUnusedLocals` / `noUnusedParameters` |
| 构建 | Vite 8.3 | 开发、生产构建、预览 |
| 样式 | Tailwind CSS 4.3 + Sass | Tailwind 通过 Vite 插件接入；页面大量使用 scoped CSS |
| 组件库 | FancyUI（`fancy-ui-vue` 0.4） | npm 依赖；当前只使用 `Switch` |
| 组件库 | Ease UI | 按源码复制到 `src/components/xly-button`，当前只有 `XlyButton` |
| 图标 | `@element-plus/icons-vue` | 只使用图标，不引入 Element Plus 组件库 |
| 发布 | PinMe | 静态上传到固定域名，`base: './'` 不能删除 |

没有 Vue Router、Pinia、ESLint、Prettier、Vitest、Playwright、CI。

## 3. 目录结构

```text
prototype-workbench/
├── AGENTS.md                         # 项目级 AI 约束入口
├── TEMPLATE_VERSION                  # 模板版本标识
├── prototype.config.example.json     # 本地实例配置示例
├── .gitignore                        # 排除个人原型、个人组件与本地配置
├── .agents/skills/prototype-management/
│   ├── SKILL.md                      # 原型管理工作流
│   └── references/                   # 本目录下的规范文件
├── README.md                         # 运行、添加页面、PinMe 发布说明
├── index.html                        # 单页入口
├── package.json
├── vite.config.ts                    # base: './' + @ 别名
├── tsconfig*.json
├── .pinme.example.json               # 固定域名配置模板
├── scripts/deploy.mjs                # 构建 + PinMe 上传
├── public/                           # favicon、icons.svg
└── src/
    ├── main.ts                       # 挂载 App
    ├── App.vue                       # 应用外壳、页面切换、显隐状态
    ├── style.css                     # 全局 Token、外壳样式
    ├── types/
    │   └── prototype.ts              # 原型状态与需求摘要类型
    ├── components/
    │   ├── AppSidebar.vue            # 自动生成的导航
    │   ├── SystemSettings.vue        # 页面显隐设置
    │   ├── PrototypeStatusTag.vue    # 跨需求复用的状态标签
    │   ├── xly-button/               # Ease UI 按钮源码副本
    │   └── local/                    # 个人公共组件（不进入模板仓库）
    ├── composables/
    │   └── useWorkbenchNavigation.ts # 需求页跳转与返回系统设置
    └── prototypes/
        ├── registry.ts               # 自动发现与排序
        ├── README.md                 # 目录内约定
        ├── .gitkeep
        └── REQ-XXXX 需求名称/          # 示例，实际由用户创建
            ├── requirement.json      # 需求元数据
            ├── 01-首页.vue
            ├── 02-详情.vue
            └── components/           # 需求专属组件（不注册为页面）
```

`dist/` 是构建产物，不手工编辑。`node_modules/` 不提交、不手改。

## 4. 运行时结构

### App.vue

- `activeId` 保存当前页面，默认 `SYSTEM_PAGE_ID = 'system-settings'`。
- 页面切换靠内部状态，不经过 URL；刷新后回到系统设置，当前页不会恢复。
- `visibleIds` 保存当前显示的页面 ID，持久化在 `localStorage` 的 `prototype-workbench-visible-pages`。
- 只保留仍存在于注册表中的 ID；未知 ID 会被过滤。
- 当前页被隐藏时自动回到系统设置。
- `Suspense` + 异步组件加载页面，加载中显示占位。
- 需求页通过 `useWorkbenchNavigation()` 跳转到其他已显示页面或返回系统设置，不直接操作 `activeId`。

### AppSidebar.vue

- 按 `group` 分组，同一时间只展开一个分组。
- 分组来自页面的一级目录；页面来自文件名。
- 系统设置固定在侧栏底部。
- 移动端 900px 以下变为抽屉导航。

### SystemSettings.vue

- 列出全部已发现页面，可逐页开关，也可全部显示/隐藏。
- 新页面默认隐藏。
- 当前只展示页面路径和显隐，不读取 `requirement.json`。

### registry.ts

- `import.meta.glob('./**/*.vue')` 自动发现页面。
- 过滤任何以 `_` 开头的路径段和名为 `components` 的目录。
- 一级目录作为 `group`；文件名去掉数字前缀后作为 `title`。
- 文件名前缀 `^\d+[\s._-]+` 用于组内排序。
- 分组排序使用 `localeCompare('zh-CN')`；目录名前面的数字不会参与分组排序。
- 根目录页面归入「页面」分组。新规范不允许新增根目录页面。

## 5. 命名与排序事实

- 需求目录使用 `REQ-XXXX 需求名称`，ID 四位补零。
- 分组按名称排序，因此 `REQ-0001` 会排在 `REQ-0100` 前面；不要依赖目录数字前缀控制分组顺序。
- 页面排序：同组内按文件名数字前缀升序；没有前缀的排在最后，再按标题排序。
- 页面 ID 是相对 `src/prototypes` 的路径（不含 `.vue`），重命名或移动页面会改变 ID，导致已保存的显隐状态失效。

## 6. 常用命令

```bash
npm install          # 首次安装
npm run dev          # 本地开发，默认 Vite 地址
npm run build        # vue-tsc -b && vite build
npm run preview      # 预览 dist
npm run deploy       # 构建并上传 PinMe（必须先获得明确授权）
npm run deploy:skip-build  # 复用 dist 上传（默认不要用）
```

`npm run build` 同时承担类型检查。构建失败时必须修复，不能跳过 `vue-tsc`。

## 7. UI 能力现状

- FancyUI：`fancy-ui-vue` 是 npm 依赖，`src/style.css` 已引入它的 Tailwind 与样式文件；当前只使用 `Switch`。
- Ease UI：`src/components/xly-button/index.vue` 是从主应用复制的源码，使用独立 SCSS 变量；没有 npm 包。
- Element Plus：只安装 `@element-plus/icons-vue`，用于图标。
- Tailwind：已接入，但现有页面主要使用 scoped CSS；新代码可以在不破坏现有风格的前提下使用工具类。
- 全局颜色和外壳尺寸在 `src/style.css` 的 `:root` 中；本阶段补充了间距、圆角、字号、阴影和状态色 Token。

## 8. AI 发现路径

- 项目级约束：`AGENTS.md`。
- 项目级 Skill：`.agents/skills/prototype-management/SKILL.md`。
- Qoder Desktop 会从工作区根目录的 `.agents/skills` 和 `.qoder/skills` 加载项目级 Skill，并读取工作区根目录的 `AGENTS.md`。
- 因此使用本项目时应把 `prototype-workbench` 目录作为工作区根目录打开；如果从父仓库根目录工作，需要显式读取本项目的 `AGENTS.md` 和 Skill 文件，不能假设会自动加载。

## 9. 已知约束与风险

- 没有前端路由，页面不能深链，刷新会回到系统设置。
- 显隐状态只存在当前浏览器的 `localStorage`，换浏览器或清缓存后会全部隐藏。
- `requirement.json` 目前是人与 AI 的约定，注册表和系统设置还不会读取它。
- 分组数字前缀不参与排序；需要顺序时使用补零的需求 ID。
- 没有自动化测试、Lint、CI；验收依赖构建、真实浏览器检查和控制台检查。
- PinMe 固定域名重复上传会覆盖旧内容；没有版本管理，误发布无法从项目内回滚。
- `vite.config.ts` 的 `base: './'` 是 IPFS 子路径部署的前提，不能删除。
- Ease UI 源码副本与主应用已经出现差异；不要假设两边可以无成本互换。
