import { defineAsyncComponent, type Component } from 'vue'

export interface PrototypePage {
  /** 根据文件路径生成的稳定标识，用于保存显示状态 */
  id: string
  /** 左侧菜单与设置页面中展示的页面名称 */
  title: string
  /** 所属菜单分组；直接放在根目录时归入「页面」 */
  group: string
  /** 相对项目根目录的文件路径 */
  source: string
  /** 文件名前缀数字，用于菜单排序 */
  order: number
  component: ReturnType<typeof defineAsyncComponent>
}

const pageModules = import.meta.glob('./**/*.vue') as Record<
  string,
  () => Promise<{ default: Component }>
>

function stripOrderPrefix(value: string) {
  return value.replace(/^\d+[\s._-]+/, '')
}

function getOrderPrefix(value: string) {
  const match = value.match(/^(\d+)[\s._-]+/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

export const prototypePages: PrototypePage[] = Object.entries(pageModules)
  .filter(([path]) => {
    const segments = path.replace(/^\.\//, '').split('/')
    return !segments.some((segment) => segment.startsWith('_') || segment === 'components')
  })
  .map(([path, loader]) => {
    const relativePath = path.replace(/^\.\//, '').replace(/\.vue$/, '')
    const segments = relativePath.split('/')
    const fileName = segments.pop() ?? relativePath
    const groupSegment = segments[0]
    const group = groupSegment ? stripOrderPrefix(groupSegment) : '页面'
    const title = stripOrderPrefix(fileName)
    const nestedTitle = segments.length > 1
      ? `${segments.slice(1).map(stripOrderPrefix).join(' / ')} / ${title}`
      : title

    return {
      id: relativePath,
      title: nestedTitle,
      group,
      source: `src/prototypes/${relativePath}.vue`,
      order: getOrderPrefix(fileName),
      component: defineAsyncComponent(loader),
    }
  })
  .sort((a, b) => {
    const groupOrder = a.group.localeCompare(b.group, 'zh-CN')
    if (groupOrder !== 0) return groupOrder
    if (a.order !== b.order) return a.order - b.order
    return a.title.localeCompare(b.title, 'zh-CN')
  })
