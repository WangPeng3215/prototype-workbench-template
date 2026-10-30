# Prototype Workbench 原型工作台

superPM 的单一原型 Hub。所有需求的页面原型集中在这个 Vue 3 + TypeScript 项目中，每个需求对应 `src/prototypes/` 下的一个目录。

本项目由只读公共模板仓库 Clone 初始化，本地副本保留 `.git` 仅用于识别模板来源。个人原型、个人组件和本地配置不进入模板仓库，也不做版本管理。

- 模板仓库：https://github.com/WangPeng3215/prototype-workbench-template
- 当前模板版本：`TEMPLATE_VERSION`（1.0.0）
- 本地实例信息：`prototype.config.json`（初始化时生成，已被 Git 忽略）
- V1.0 不自动 Pull、不自动升级；升级需单独授权并先备份。

## 初始化

新终端由 superPM 主入口 Skill 调用初始化脚本完成。手动初始化时，确保目标目录不存在或为空：

```bash
git clone https://github.com/WangPeng3215/prototype-workbench-template.git workspace/prototype-workbench
cd workspace/prototype-workbench
npm ci
```

不要向已有非空目录执行覆盖式 Clone，也不要把个人原型复制回模板仓库。

## 运行

```bash
npm install
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

`npm run build` 会先执行 `vue-tsc -b`，类型检查失败时不会生成构建产物。

## 原型管理规范

AI 和人工开发前先读：

- `AGENTS.md`：项目级硬约束。
- `.agents/skills/prototype-management/SKILL.md`：原型管理工作流。
- `.agents/skills/prototype-management/references/`：归属、UI、交互、AI 行为、验收发布细则。

核心约定：

- 一个需求一个归属单元：`src/prototypes/REQ-XXXX 需求名称/`。
- 一个需求可以有多页，页面命名 `NN-页面名称.vue`。
- 需求元数据放在目录内的 `requirement.json`。
- 需求专属组件放在需求目录的 `components/`；跨需求复用才提升到 `src/components/`。
- 新页面默认隐藏，在「系统设置」中打开。
- 已验收需求在系统设置中隐藏全部页面，但保留代码。
- 未经当前对话明确授权，不删除已有原型，不发布到 PinMe。

## 模板边界

- 公共模板只分发框架、基础组件、规范和 Skill，不收集个人原型。
- `src/prototypes/REQ-*/` 与 `src/components/local/` 已被 `.gitignore` 排除；个人原型和组件只留在本地。
- `prototype.config.json`、`.pinme.json`、`.env*` 只属于本地实例，不提交。
- 不向模板仓库提交、推送、建分支或 PR；不自动 Pull 或升级。

## 添加原型页面

```text
src/prototypes/
└── REQ-0001 示例需求/
    ├── requirement.json
    ├── 01-首页.vue
    ├── 02-详情.vue
    └── components/
        └── ExampleCard.vue
```

- 第一层文件夹作为导航分组，也是需求归属单元。
- 文件名自动成为页面名称；数字前缀只用于组内排序。
- 直接放在 `src/prototypes/` 根目录的页面会归入「页面」分组；新规范不允许这样新增。
- 以 `_` 开头的路径段和 `components` 目录不会注册为页面。
- 分组按名称排序；需求 ID 使用四位补零，不要依赖目录数字前缀控制分组顺序。

页面注册逻辑位于 `src/prototypes/registry.ts`，页面统一使用异步组件加载。

## 页面显隐

- 侧栏默认只显示「系统设置」。
- 系统设置页面列出所有已发现的页面，可单独开关，也可全部显示或全部隐藏。
- 显示状态保存在浏览器 `localStorage`，不会修改页面源码。
- 新增页面不会自动显示，避免原型数量变多后导航失控。
- 显隐状态只对当前浏览器有效，换浏览器或清缓存后会全部隐藏。

## 技术栈

- Vue 3 + TypeScript + Vite
- Tailwind CSS 4 + Sass
- Fancy UI：`fancy-ui-vue`，当前用于页面显隐开关
- Ease UI：`src/components/xly-button` 为按源码复制的按钮组件
- Element Plus：只使用 `@element-plus/icons-vue` 图标
- 无 Vue Router：页面切换由 `App.vue` 的内部状态完成，刷新回到系统设置

## 发布到 PinMe（固定地址）

项目是纯静态站点，走 PinMe 的「静态上传 + 固定域名」模式：先定好一个域名，以后每次都往同一个域名上传，地址不变。

**未经当前对话明确授权，不要执行发布。** 发布脚本会覆盖固定域名，且本项目没有版本管理，无法从项目内回滚。

### 首次发布

```bash
# 1. 认证（二选一，AppKey 在 pinme.eth.limo 控制台获取）
pinme login
pinme set-appkey <你的 AppKey>

# 2. 写死固定域名
cp .pinme.example.json .pinme.json
# 编辑 .pinme.json，把 domain 改成你要的子域名

# 3. 发布
npm run deploy
```

发布完成后地址是 `https://<你的子域名>.pinme.eth.limo`。

### 后续更新

```bash
npm run deploy
```

同一条命令：构建 → 上传到同一个域名 → 覆盖旧内容，地址保持不变。

```bash
npm run deploy -- --skip-build   # 复用已有 dist，只上传（默认不要用）
npm run deploy -- 别的域名        # 临时换域名，不读 .pinme.json
PINME_DOMAIN=别的域名 npm run deploy
```

脚本会先构建再上传，并在未登录、没拿到 CID 时以非 0 退出码失败，不会假成功。

### 用自有域名

1. 在域名 DNS 添加 CNAME 记录指向 `p.eth.flights`。
2. 把 `.pinme.json` 的 `domain` 改成你的域名（如 `proto.example.com`）。
3. `npm run deploy`。

绑定自有域名需要 PinMe 钱包里有余额；用 PinMe 子域名则不需要。

### 关键约束

- `vite.config.ts` 已设置 `base: './'`。IPFS 站点挂在子路径下，用绝对路径 `/assets/*` 会 404，这个配置不能删。
- 项目用的是内部状态切页，没有前端路由，因此不存在刷新 404 的问题。

## 目录

```text
AGENTS.md                    # 项目级 AI 约束
TEMPLATE_VERSION             # 模板版本标识
prototype.config.example.json # 本地实例配置示例
.gitignore                   # 排除个人原型、个人组件与本地配置
.agents/skills/
└── prototype-management/    # 原型管理 Skill 与 references
src/
├── prototypes/              # 需求原型，自动注册
│   ├── registry.ts
│   ├── README.md
│   ├── .gitkeep
│   └── REQ-XXXX 需求名称/
├── components/
│   ├── AppSidebar.vue       # 自动生成的导航
│   ├── SystemSettings.vue   # 页面显隐设置
│   ├── PrototypeStatusTag.vue
│   ├── xly-button/          # Ease UI 按钮
│   └── local/               # 个人公共组件（不进入模板仓库）
├── types/
├── App.vue
└── style.css                # 全局设计 Token
scripts/deploy.mjs           # 构建 + 上传到固定域名
.pinme.example.json          # 固定域名配置模板
```

## 不做的事

- 不向模板仓库提交、推送、打标签、建分支或 PR。
- 不建立版本号、变更日志或版本目录；个人原型不进入版本管理。
- 不在未授权时发布或覆盖 PinMe 域名。
- 不把 prototype-workbench 做成 superPM 运行时的一部分。
