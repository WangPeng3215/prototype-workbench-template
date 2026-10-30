# 原型页面目录

`src/prototypes` 是所有需求原型的唯一存放位置。一个需求对应一个一级目录，目录内可以有多个页面。

需求目录已被 `.gitignore` 排除，只保留 `registry.ts`、`README.md` 和 `.gitkeep`；个人原型不进入模板仓库。

## 需求归属单元

```text
src/prototypes/
├── REQ-0001 示例需求/
│   ├── requirement.json
│   ├── 01-首页.vue
│   ├── 02-详情.vue
│   └── components/
│       └── ExampleCard.vue
└── REQ-0002 另一个需求/
    ├── requirement.json
    └── 01-设计规范.vue
```

- 一级目录名使用 `REQ-XXXX 需求名称`，需求 ID 四位补零。
- 目录名与 `requirement.json` 的 `requirementId` 必须一致。
- 一个需求只建一个目录；不按阶段、版本或日期拆分。
- 分组按名称排序，不要依赖目录数字前缀控制顺序。

## requirement.json

```json
{
  "requirementId": "REQ-0001",
  "requirementName": "示例需求",
  "status": "in-progress",
  "summary": "示例需求原型的范围说明。",
  "owner": "示例负责人",
  "updatedAt": "2026-01-01"
}
```

状态：`draft` / `in-progress` / `in-review` / `accepted` / `archived`。元数据目前供人和 AI 读取，注册表还不会自动读取它。

## 页面与组件

- 页面命名 `NN-页面名称.vue`；数字前缀只用于组内排序，不显示在菜单中。
- 页面标题来自文件名；重命名会改变页面 ID 并使显隐状态失效，需先确认。
- 需求专属组件放在需求目录的 `components/`，不会被注册为页面。
- 跨需求复用的组件放到 `src/components/`，且不能依赖某个需求的 Mock 数据。
- 不允许直接导入其他需求的页面、组件或 Mock 数据。
- 新页面不得放在 `src/prototypes/` 根目录。

## 显示规则

- 新页面默认隐藏。
- 打开左侧「系统设置」，在页面列表中控制每个页面的显示状态。
- 页面显示状态保存在当前浏览器，不会修改页面源码。
- 需求验收后标记 `accepted`，在系统设置中隐藏全部页面，但保留代码。
- 不删除已验收需求；需要修改时改回 `in-progress` 并重新打开页面。

完整规则见项目根目录的 `AGENTS.md` 和 `.agents/skills/prototype-management/`。
