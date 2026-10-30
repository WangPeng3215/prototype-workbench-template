<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from 'fancy-ui-vue'
import { Document, FolderOpened, Setting } from '@element-plus/icons-vue'
import XlyButton from './xly-button/index.vue'
import type { PrototypePage } from '../prototypes/registry'

const props = defineProps<{
  pages: PrototypePage[]
  visibleIds: string[]
}>()

const emit = defineEmits<{
  togglePage: [id: string, visible: boolean]
  showAll: []
  hideAll: []
}>()

const groups = computed(() => {
  const result: Array<{ name: string; pages: PrototypePage[] }> = []
  for (const page of props.pages) {
    const existing = result.find((group) => group.name === page.group)
    if (existing) existing.pages.push(page)
    else result.push({ name: page.group, pages: [page] })
  }
  return result
})

const visibleCount = computed(
  () => props.pages.filter((page) => props.visibleIds.includes(page.id)).length,
)

function isVisible(id: string) {
  return props.visibleIds.includes(id)
}
</script>

<template>
  <div class="settings-page">
    <header class="settings-heading">
      <div>
        <h1>系统设置</h1>
        <p>控制哪些原型页面出现在左侧导航中。</p>
      </div>
      <div class="settings-stats">
        <span><strong>{{ pages.length }}</strong> 个原型页面</span>
        <span class="stats-divider" />
        <span><strong>{{ visibleCount }}</strong> 个已显示</span>
      </div>
    </header>

    <section class="settings-card">
      <div class="settings-card-head">
        <div><h2>页面显示</h2><p>新添加的页面默认隐藏，打开开关后即可在导航中访问。</p></div>
        <div v-if="pages.length" class="settings-actions">
          <XlyButton type="text" size="small" :disabled="visibleCount === 0" @click="emit('hideAll')">全部隐藏</XlyButton>
          <XlyButton type="ghost" size="small" :disabled="visibleCount === pages.length" @click="emit('showAll')">全部显示</XlyButton>
        </div>
      </div>

      <div class="system-row">
        <span class="row-icon is-system"><Setting /></span>
        <div class="row-copy">
          <strong>系统设置</strong>
          <span>固定显示，不能隐藏</span>
        </div>
        <span class="fixed-label">系统页面</span>
        <Switch :checked="true" disabled size="sm" label="系统设置固定显示" />
      </div>

      <template v-if="pages.length">
        <section v-for="group in groups" :key="group.name" class="page-group">
          <div class="page-group-title"><FolderOpened /><span>{{ group.name }}</span><i>{{ group.pages.length }}</i></div>
          <div v-for="page in group.pages" :key="page.id" class="page-row">
            <span class="row-icon"><Document /></span>
            <div class="row-copy">
              <strong>{{ page.title }}</strong>
              <code>{{ page.source }}</code>
            </div>
            <Switch
              :checked="isVisible(page.id)"
              :label="`${isVisible(page.id) ? '隐藏' : '显示'}${page.title}`"
              size="sm"
              @checked-change="emit('togglePage', page.id, $event)"
            />
          </div>
        </section>
      </template>

      <div v-else class="settings-empty">
        <span class="empty-icon"><Document /></span>
        <strong>还没有原型页面</strong>
        <p>在项目的 <code>src/prototypes</code> 目录中新建 Vue 页面，保存后会自动出现在这里。</p>
        <div class="empty-example"><span>src/prototypes/</span><span>页面分组/页面名称.vue</span></div>
      </div>
    </section>

    <footer class="settings-note">
      <span class="note-dot" />
      <span>页面自动读取自 <code>src/prototypes</code>，显示状态仅保存在当前浏览器。</span>
    </footer>
  </div>
</template>

<style scoped>
.settings-page { width: min(980px, 100%); margin: 0 auto; padding: 26px 30px 36px; }
.settings-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
.settings-heading h1 { margin: 0; color: var(--text-primary); font-size: 20px; font-weight: 650; letter-spacing: -.025em; }
.settings-heading p { margin: 6px 0 0; color: var(--text-tertiary); font-size: 12px; }
.settings-stats { display: flex; align-items: center; gap: 10px; color: #8b94a6; font-size: 11px; white-space: nowrap; }
.settings-stats strong { color: #5f6a7e; font-weight: 600; }
.stats-divider { width: 1px; height: 12px; background: #dfe4ed; }
.settings-card { border: 1px solid var(--border-subtle); border-radius: 11px; background: #fff; box-shadow: 0 3px 14px rgba(30, 41, 59, .025); overflow: hidden; }
.settings-card-head { min-height: 69px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 13px 18px; border-bottom: 1px solid #edf0f5; }
.settings-card-head h2 { margin: 0; color: #3c4456; font-size: 13px; font-weight: 600; }
.settings-card-head p { margin: 4px 0 0; color: #989fad; font-size: 10px; }
.settings-actions { display: flex; align-items: center; gap: 4px; }
.system-row, .page-row { display: flex; align-items: center; gap: 11px; min-height: 58px; padding: 9px 18px; border-bottom: 1px solid #f1f3f7; }
.system-row { background: #fbfcfe; }
.row-icon { width: 31px; height: 31px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 8px; background: #f1f4f9; color: #8792a4; }
.row-icon svg { width: 15px; height: 15px; }
.row-icon.is-system { background: #edf1ff; color: var(--primary); }
.row-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.row-copy strong { color: #4d5668; font-size: 12px; font-weight: 500; }
.row-copy span, .row-copy code { overflow: hidden; color: #9ba2b0; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.row-copy code { font-family: ui-monospace, "Cascadia Code", monospace; }
.fixed-label { flex: 0 0 auto; padding: 3px 7px; border-radius: 5px; background: #eef2ff; color: #6575cf; font-size: 9px; }
.page-group-title { min-height: 36px; display: flex; align-items: center; gap: 7px; padding: 0 19px; border-bottom: 1px solid #f2f4f8; background: #fafbfd; color: #7f8899; font-size: 10px; font-weight: 500; }
.page-group-title svg { width: 13px; height: 13px; color: #a1a9b8; }
.page-group-title i { margin-left: 2px; color: #b2b8c4; font-size: 9px; font-style: normal; }
.page-row { transition: background .16s ease; }
.page-row:hover { background: #fbfcff; }
.page-group .page-row:last-child { border-bottom: 0; }
.page-group + .page-group .page-group-title { border-top: 1px solid #edf0f5; }
.settings-empty { display: flex; flex-direction: column; align-items: center; padding: 46px 20px 50px; text-align: center; }
.empty-icon { width: 42px; height: 42px; display: grid; place-items: center; margin-bottom: 12px; border-radius: 11px; background: #f2f4f9; color: #9da5b4; }
.empty-icon svg { width: 19px; height: 19px; }
.settings-empty strong { color: #606a7d; font-size: 13px; font-weight: 500; }
.settings-empty p { max-width: 430px; margin: 7px 0 14px; color: #9ba2b0; font-size: 11px; line-height: 1.7; }
.settings-empty code { color: #75809a; font-family: ui-monospace, "Cascadia Code", monospace; }
.empty-example { display: flex; align-items: center; gap: 0; overflow: hidden; border: 1px solid #e7ebf2; border-radius: 7px; background: #fafbfc; font-family: ui-monospace, "Cascadia Code", monospace; font-size: 10px; }
.empty-example span { padding: 7px 9px; color: #8993a4; }
.empty-example span:first-child { border-right: 1px solid #e7ebf2; color: #a0a8b6; }
.settings-note { display: flex; align-items: center; gap: 7px; margin-top: 12px; padding: 0 2px; color: #a1a8b5; font-size: 10px; }
.note-dot { width: 5px; height: 5px; flex: 0 0 auto; border-radius: 50%; background: #c3cad7; }
.settings-note code { color: #8993a4; font-family: ui-monospace, "Cascadia Code", monospace; }
.settings-page :deep(.ft-switch) { --ft-accent: var(--primary); }
@media (max-width: 680px) {
  .settings-page { padding: 18px 12px 28px; }
  .settings-heading { align-items: flex-start; margin-bottom: 14px; }
  .settings-heading h1 { font-size: 18px; }
  .settings-heading p { max-width: 230px; line-height: 1.6; }
  .settings-stats { flex-direction: column; align-items: flex-end; gap: 3px; }
  .stats-divider { display: none; }
  .settings-card-head { align-items: flex-start; flex-direction: column; gap: 9px; padding: 13px 14px; }
  .settings-actions { align-self: flex-end; }
  .system-row, .page-row { padding: 9px 14px; }
  .fixed-label { display: none; }
  .empty-example { flex-direction: column; gap: 0; }
  .empty-example span:first-child { border-right: 0; border-bottom: 1px solid #e7ebf2; }
}
</style>
