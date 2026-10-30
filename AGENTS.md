# AGENTS.md

## 项目身份

`prototype-workbench` 是 superPM 的单一原型 Hub，用 Vue 3 + TypeScript + Vite 维护所有需求的页面原型。

- 由只读公共模板仓库 Clone 初始化；本地 `.git` 仅用于识别模板来源，不向模板仓库提交、推送、建分支或 PR。个人原型不进入版本管理。
- 模板版本见 `TEMPLATE_VERSION`；本地实例信息见 `prototype.config.json`（初始化时生成，不提交）。
- 不是 superPM 运行时的一部分：不连接数据库，不调用后端接口，只使用本地 Mock 数据。
- 一个需求对应 `src/prototypes/REQ-XXXX 需求名称/` 一个目录；目录内可有多页和专属组件。

## AI 进入项目后先做什么

1. 读本文件。
2. 读 `.agents/skills/prototype-management/SKILL.md`。
3. 按任务读取该 Skill 的 `references/` 规范。
4. 读目标需求的 `requirement.json` 和现有页面，再动手。

Qoder Desktop 会从工作区根目录的 `.agents/skills` 和 `.qoder/skills` 加载项目级 Skill，并读取根目录 `AGENTS.md`。使用本项目时，应把 `prototype-workbench` 目录作为工作区根目录打开；如果从父仓库根目录工作，必须显式读取上述文件，不能假设会自动加载。

## 硬约束

- 不向模板仓库提交、推送、打标签、建分支或 PR；不创建 `v1/`、`backup/`、`archive/` 等版本目录，不写变更日志。
- 个人原型目录 `src/prototypes/REQ-*` 与个人公共组件目录 `src/components/local/` 不进入模板仓库。
- 未经当前对话明确授权，不执行 `npm run deploy`，不覆盖 PinMe 固定域名。
- 未经明确授权，不删除、重命名、移动已有原型目录或页面。
- 只修改目标需求目录；不修改其他需求的原型。需要跨需求复用时，先按规范提升为 `src/components/` 公共组件。
- 不引入 Vue Router、Pinia、新组件库或新依赖，除非用户明确要求。
- 不直接操作 superPM 数据库、文件或审计数据；MCP 写回必须经业务服务且另行授权。
- 不编辑 `dist/`，不关闭类型检查，不通过删除页面或注释功能让构建通过。

## 目录约定

```text
src/prototypes/REQ-XXXX 需求名称/
├── requirement.json          # 需求 ID、名称、状态、负责人、更新时间
├── 01-页面名称.vue
├── 02-页面名称.vue
└── components/               # 需求专属组件，不注册为页面
```

- 需求 ID 使用 superPM 的 `REQ-XXXX`，四位补零，目录名与 `requirement.json` 一致。
- 页面放在需求目录内，文件名即页面标题；数字前缀只用于组内排序。
- 新页面默认隐藏，必须在「系统设置」中打开。
- 需求验收后标记 `accepted`，在系统设置中隐藏全部页面，但保留代码。
- 公共组件放在 `src/components/`，不能依赖某个需求的 Mock 数据。
- 个人公共组件放在 `src/components/local/`；该目录已被 Git 忽略，不进入模板仓库。

详细规则见 Skill 的 `references/prototype-rules.md`。

## 技术栈与关键事实

- Vue 3.5 + TypeScript 6 + Vite 8 + Tailwind 4 + Sass。
- FancyUI 通过 npm 引入，当前只使用 `Switch`。
- Ease UI 以源码副本形式放在 `src/components/xly-button`。
- Element Plus 只用 `@element-plus/icons-vue` 图标，不引入组件库。
- 没有 Vue Router；`App.vue` 用 `activeId` 切换页面，刷新回到系统设置。
- 页面由 `src/prototypes/registry.ts` 自动发现；一级目录是分组，文件名是标题。
- 显隐状态存在 `localStorage` 的 `prototype-workbench-visible-pages`，仅当前浏览器有效。
- `vite.config.ts` 的 `base: './'` 是 PinMe/IPFS 子路径部署的前提，不能删除。

## 命令

```bash
npm run dev       # 本地开发
npm run build     # vue-tsc -b && vite build
npm run preview   # 预览 dist
npm run deploy    # 构建并发布 PinMe（需当前对话明确授权）
```

## 完成标准

- 目标需求的页面/组件已完成，未越界修改其他需求。
- `npm run build` 通过。
- 真实浏览器中验证了页面打开、主要交互、窄屏布局和控制台无报错。
- 汇报了改动文件、验证结果、风险和“未发布”状态。
- 除非用户当前明确授权，否则不发布、不回写 superPM 正式数据。

## 规范索引

- `.agents/skills/prototype-management/SKILL.md`：工作流入口。
- `references/project-structure.md`：真实结构与约束。
- `references/prototype-rules.md`：归属、元数据、组件边界、验收与删除。
- `references/ui-design-rules.md`：Token、组件库边界、视觉与布局。
- `references/interaction-rules.md`：导航、显隐、弹窗、表单、Mock、可访问性。
- `references/ai-development-rules.md`：AI 修改边界、确认事项、验证与汇报。
- `references/release-rules.md`：验收、PinMe 授权、发布后验证、MCP 回写。
