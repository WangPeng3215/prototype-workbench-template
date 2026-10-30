---
name: prototype-management
description: 在 prototype-workbench 中新增、修改、验收或发布需求原型时使用。约束需求归属、UI 与交互一致性、AI 改动边界、验收检查和 PinMe 发布授权。
---

# 原型管理工作流

## 何时使用

在 `prototype-workbench` 中做以下任一事情时，先读取本 Skill：

- 新增或修改需求原型页面。
- 调整原型导航、显隐、页面结构。
- 新增或提升公共组件。
- 验收、隐藏、归档需求原型。
- 准备构建、预览或发布到 PinMe。
- 不确定某个文件属于哪个需求、能不能改。

仅做与原型无关的 superPM 主应用开发时，不需要使用本 Skill。

## 必读顺序

1. 项目根目录 `AGENTS.md`：不可违反的项目级约束。
2. 本文件：工作流和交付标准。
3. 按任务读取 `references/` 中的相关规范，不要一次加载全部。
4. 目标需求的 `requirement.json` 和现有页面；先理解再修改。

## 工作流

### 第 1 步：确认归属

- 确认 superPM 需求 ID、需求名称和本次目标。
- 在 `src/prototypes/` 下查找是否已有 `REQ-XXXX 需求名称` 目录。
- 已有目录：在目录内追加或修改，不新建第二个归属单元。
- 没有目录：按 `references/prototype-rules.md` 新建目录和 `requirement.json`，并说明这是新增归属。
- 没有需求 ID 或归属不明时，停下来向用户确认；不要创建无归属页面。

### 第 2 步：划定修改范围

用一句话说明：

```text
本次只修改 src/prototypes/REQ-XXXX .../ 下的 A、B 文件；
复用 src/components/X 公共组件；不改其他需求；验证方式为 ...
```

- 只改目标需求目录；需要改公共组件时，先确认影响的其他需求。
- 不做无关重构、格式化、重命名、依赖升级。
- 不删除、移动、重命名已有页面或目录，除非用户明确确认。

### 第 3 步：读取现有实现

- 读 `requirement.json`，确认状态是 `draft` / `in-progress` / `in-review` / `accepted` / `archived`。
- 读目标页面和同需求组件，确认已有布局、Mock 数据和交互。
- 查看 `src/components/` 是否有可复用组件；查看 `src/style.css` 的 Token。
- 不要假设存在 Router、Layouts、Config、测试或 CI。

### 第 4 步：实现

- 页面放在需求目录内，命名 `NN-页面名称.vue`。
- 需求专属组件放需求目录的 `components/`；公共组件放 `src/components/`，且不能依赖某个需求的 Mock 数据。
- 使用现有设计 Token、`XlyButton`、FancyUI `Switch`、Element Plus 图标。
- 业务原型页不写页面级大标题；上下文放在工具栏。
- Mock 数据留在需求目录，确定、可重复，不使用真实令牌。
- 具体视觉和交互要求见 `references/ui-design-rules.md` 与 `references/interaction-rules.md`。

### 第 5 步：自检

- 运行 `npm run build`，确认类型检查和构建通过。
- 运行 `npm run dev`，在真实浏览器中打开页面。
- 检查：从系统设置打开页面、导航高亮、主要交互、空/加载/错误态、900px 和 680px 布局、控制台无报错。
- 检查没有修改其他需求；没有未确认的删除或重命名。
- 无法验证时明确说明，不要声称通过。

### 第 6 步：汇报并等待确认

按以下格式汇报：

```text
需求：REQ-XXXX 需求名称
改动：文件列表
行为：用户可见变化
验证：构建 + 浏览器 + 控制台结果
风险：未覆盖场景、待确认事项
发布：未发布
```

- 用户确认本地预览前，不进入发布。
- 用户没有明确说“发布/部署/上传”时，不执行 `npm run deploy`。
- 发布成功且链接验证有效后，才可讨论 MCP 回写；回写还需要用户单独授权。

### 第 7 步：验收或归档

- 用户验收后，把 `requirement.json.status` 改为 `accepted`。
- 在「系统设置」中关闭该需求全部页面，保留代码、组件和元数据。
- 不删除已验收需求；需要修改时把状态改回 `in-progress` 并重新打开页面。
- 不做版本管理：不建版本目录、不写变更日志；不向模板仓库提交或推送。

## 硬约束

- 不向模板仓库提交、推送、打标签、建分支或 PR；不建版本目录或变更日志。
- 未经当前对话明确授权，不执行 PinMe 发布，不覆盖固定域名。
- 未经明确授权，不删除、重命名、移动已有原型。
- 不修改其他需求的原型；跨需求共享必须先提升为公共组件。
- 不直接改 superPM 数据库、文件或审计数据；MCP 回写必须经业务服务且另行授权。
- 不引入 Vue Router、状态管理、新组件库或新依赖，除非用户明确要求。
- 不编辑 `dist/`，不关闭类型检查，不通过删除页面来让构建通过。

## 规范索引

| 文件 | 内容 |
| --- | --- |
| `references/project-structure.md` | 真实目录、技术栈、运行时、命令、已知约束 |
| `references/prototype-rules.md` | 需求归属、目录命名、元数据、页面/组件边界、验收与删除 |
| `references/ui-design-rules.md` | 设计 Token、Ease UI/FancyUI/Element/Tailwind 边界、布局、玻璃质感 |
| `references/interaction-rules.md` | 导航、显隐、弹窗、表单、列表、反馈、Mock、键盘与移动端 |
| `references/ai-development-rules.md` | 开发前检查、修改边界、升级确认、实现要求、验证与汇报 |
| `references/release-rules.md` | 验收清单、本地预览、PinMe 发布授权、发布后验证、MCP 回写 |

按任务读取，不要一次性把所有规范塞进上下文；但涉及发布、删除、跨需求改动时，必须读取对应规范。

## 快速命令

```bash
npm run dev                 # 本地开发
npm run build               # 类型检查 + 生产构建
npm run preview             # 预览 dist
npm run deploy              # 构建并发布 PinMe（必须获得当前对话明确授权）
```

## 不要做的事

- 不要根据通用 Vue 模板假设项目有 `router/`、`layouts/`、`config/`、测试或 CI。
- 不要把新页面放在 `src/prototypes/` 根目录。
- 不要用 `localStorage` 或硬编码数组替代 `registry.ts` 的自动发现。
- 不要把只被一个需求使用的组件提前放进 `src/components/`。
- 不要在没有用户确认的情况下发布或回写正式数据。
