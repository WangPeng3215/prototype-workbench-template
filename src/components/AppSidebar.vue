<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowDown, Close, FolderOpened, Setting } from '@element-plus/icons-vue'
import type { PrototypePage } from '../prototypes/registry'

const props = defineProps<{
  pages: PrototypePage[]
  activeId: string
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  settings: []
  close: []
}>()

const SYSTEM_PAGE_ID = 'system-settings'
const openGroup = ref('')

const groups = computed(() => {
  const result: Array<{ name: string; pages: PrototypePage[] }> = []
  for (const page of props.pages) {
    const existing = result.find((group) => group.name === page.group)
    if (existing) existing.pages.push(page)
    else result.push({ name: page.group, pages: [page] })
  }
  return result
})

watch(
  () => [groups.value, props.activeId] as const,
  () => {
    const activeGroup = groups.value.find((group) => group.pages.some((page) => page.id === props.activeId))
    if (activeGroup && activeGroup.name !== openGroup.value) openGroup.value = activeGroup.name
    else if (!groups.value.some((group) => group.name === openGroup.value)) openGroup.value = groups.value[0]?.name ?? ''
  },
  { immediate: true },
)

function toggleGroup(name: string) {
  openGroup.value = openGroup.value === name ? '' : name
}

function selectPage(id: string) {
  emit('select', id)
  emit('close')
}

function goToSettings() {
  emit('settings')
  emit('close')
}
</script>

<template>
  <div v-if="mobileOpen" class="sidebar-scrim" @click="emit('close')" />
  <aside class="app-sidebar" :class="{ 'is-mobile-open': mobileOpen }" aria-label="原型导航">
    <div class="sidebar-mobile-head">
      <span>原型页面</span>
      <button class="icon-button" aria-label="关闭导航" @click="emit('close')"><Close /></button>
    </div>

    <div class="sidebar-caption">原型页面</div>
    <nav class="sidebar-nav">
      <template v-if="groups.length">
        <section v-for="group in groups" :key="group.name" class="menu-group">
          <button
            class="menu-group-trigger"
            :class="{ 'is-open': openGroup === group.name }"
            :aria-expanded="openGroup === group.name"
            :aria-controls="`menu-panel-${group.name}`"
            @click="toggleGroup(group.name)"
          >
            <FolderOpened class="menu-icon" />
            <span>{{ group.name }}</span>
            <span class="menu-group-count">{{ group.pages.length }}</span>
            <ArrowDown class="menu-chevron" />
          </button>

          <Transition name="accordion">
            <div v-show="openGroup === group.name" :id="`menu-panel-${group.name}`" class="menu-group-panel">
              <button
                v-for="page in group.pages"
                :key="page.id"
                class="menu-child"
                :class="{ 'is-active': activeId === page.id }"
                :aria-current="activeId === page.id ? 'page' : undefined"
                @click="selectPage(page.id)"
              >
                <span class="menu-child-line" />
                <span>{{ page.title }}</span>
              </button>
            </div>
          </Transition>
        </section>
      </template>

      <div v-else class="menu-empty">
        <span class="menu-empty-icon"><FolderOpened /></span>
        <strong>暂无显示的页面</strong>
        <p>在 <code>src/prototypes</code> 中添加页面后，可在这里显示。</p>
      </div>
    </nav>

    <div class="sidebar-bottom">
      <button
        class="system-settings-button"
        :class="{ 'is-active': activeId === SYSTEM_PAGE_ID }"
        @click="goToSettings"
      >
        <Setting />
        <span>系统设置</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-scrim { display: none; }
.app-sidebar {
  width: var(--sidebar-width);
  flex: 0 0 var(--sidebar-width);
  height: calc(100vh - var(--header-height));
  position: sticky;
  top: var(--header-height);
  display: flex;
  flex-direction: column;
  background: #fbfcff;
  border-right: 1px solid var(--border-subtle);
  z-index: 30;
}
.sidebar-mobile-head { display: none; }
.sidebar-caption {
  padding: 22px 22px 10px;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
}
.sidebar-nav { flex: 1; overflow-y: auto; padding: 0 12px 20px; }
.menu-group { margin-bottom: 5px; }
.menu-group-trigger {
  width: 100%; min-height: 44px; display: flex; align-items: center; gap: 10px;
  padding: 0 11px; border: 0; border-radius: 8px; background: transparent;
  color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background .18s ease, color .18s ease;
}
.menu-group-trigger:hover, .menu-group-trigger.is-open { background: #f1f3fa; color: var(--text-primary); }
.menu-icon { width: 16px; height: 16px; color: #7d8599; }
.menu-group-count {
  min-width: 20px; margin-left: auto; padding: 1px 6px; border-radius: 9px;
  background: #edf0f7; color: #8b93a4; font-size: 10px; font-weight: 500; text-align: center;
}
.menu-chevron { width: 12px; height: 12px; color: #a0a7b7; transition: transform .22s ease; }
.is-open .menu-chevron { transform: rotate(180deg); }
.menu-group-panel { overflow: hidden; padding: 3px 0 5px; }
.menu-child {
  position: relative; width: 100%; min-height: 42px; display: flex; align-items: center;
  border: 0; border-radius: 7px; padding: 0 12px 0 39px; background: transparent;
  color: #687085; font-size: 13px; text-align: left; cursor: pointer;
  transition: color .18s ease, background .18s ease;
}
.menu-child:hover { background: #f4f5fb; color: var(--primary); }
.menu-child.is-active { background: var(--primary-soft); color: var(--primary); font-weight: 600; }
.menu-child-line {
  position: absolute; left: 20px; width: 5px; height: 5px;
  border: 1px solid #c5cad6; border-radius: 50%;
}
.menu-child.is-active .menu-child-line {
  border-color: var(--primary); background: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 110, 247, .1);
}
.menu-empty { display: flex; flex-direction: column; align-items: center; padding: 28px 12px; text-align: center; }
.menu-empty-icon { width: 36px; height: 36px; display: grid; place-items: center; margin-bottom: 11px; border-radius: 9px; background: #f1f3f9; color: #98a1b3; }
.menu-empty-icon svg { width: 17px; height: 17px; }
.menu-empty strong { color: #757e90; font-size: 12px; font-weight: 500; }
.menu-empty p { margin: 6px 0 0; color: #a0a7b5; font-size: 10px; line-height: 1.6; }
.menu-empty code { color: #8892a5; font-family: ui-monospace, "Cascadia Code", monospace; }
.sidebar-bottom { padding: 12px; border-top: 1px solid var(--border-subtle); }
.system-settings-button {
  width: 100%; min-height: 42px; display: flex; align-items: center; gap: 10px;
  padding: 0 12px; border: 0; border-radius: 8px; background: transparent;
  color: var(--text-secondary); font-size: 13px; cursor: pointer;
  transition: background .18s ease, color .18s ease;
}
.system-settings-button:hover { background: #f1f3fa; color: var(--primary); }
.system-settings-button.is-active { background: var(--primary-soft); color: var(--primary); font-weight: 600; }
.system-settings-button svg { width: 16px; height: 16px; }
.accordion-enter-active, .accordion-leave-active { transition: opacity .18s ease, transform .18s ease; transform-origin: top; }
.accordion-enter-from, .accordion-leave-to { opacity: 0; transform: translateY(-4px); }
@media (max-width: 900px) {
  .sidebar-scrim { display: block; position: fixed; inset: var(--header-height) 0 0; background: rgba(15, 23, 42, .35); backdrop-filter: blur(2px); z-index: 39; }
  .app-sidebar {
    position: fixed; left: 0; top: var(--header-height);
    transform: translateX(-100%); transition: transform .25s ease;
    z-index: 40; box-shadow: 16px 0 40px rgba(15, 23, 42, .1);
  }
  .app-sidebar.is-mobile-open { transform: translateX(0); }
  .sidebar-caption { display: none; }
  .sidebar-nav { padding-top: 10px; }
  .sidebar-mobile-head {
    min-height: 50px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px; border-bottom: 1px solid var(--border-subtle);
    color: var(--text-primary); font-size: 14px; font-weight: 600;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-sidebar, .menu-chevron, .accordion-enter-active, .accordion-leave-active { transition: none; }
}
</style>
