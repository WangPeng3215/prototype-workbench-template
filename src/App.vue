<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import AppSidebar from './components/AppSidebar.vue'
import SystemSettings from './components/SystemSettings.vue'
import { workbenchNavigationKey } from './composables/useWorkbenchNavigation'
import { prototypePages } from './prototypes/registry'

const VISIBILITY_STORAGE_KEY = 'prototype-workbench-visible-pages'
const SYSTEM_PAGE_ID = 'system-settings'

const activeId = ref(SYSTEM_PAGE_ID)
const mobileOpen = ref(false)
const visibleIds = ref<string[]>(loadVisibleIds())

const visiblePages = computed(() =>
  prototypePages.filter((page) => visibleIds.value.includes(page.id)),
)
const activePage = computed(() => prototypePages.find((page) => page.id === activeId.value) ?? null)

watch(visibleIds, (ids) => {
  localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(ids))
  if (activeId.value !== SYSTEM_PAGE_ID && !ids.includes(activeId.value)) {
    activeId.value = SYSTEM_PAGE_ID
  }
}, { deep: true })

function loadVisibleIds(): string[] {
  try {
    const saved = localStorage.getItem(VISIBILITY_STORAGE_KEY)
    const parsed: unknown = saved ? JSON.parse(saved) : []
    if (!Array.isArray(parsed)) return []
    const knownIds = new Set(prototypePages.map((page) => page.id))
    return parsed.filter((id): id is string => typeof id === 'string' && knownIds.has(id))
  } catch {
    return []
  }
}

function togglePage(id: string, visible: boolean) {
  const next = new Set(visibleIds.value)
  if (visible) next.add(id)
  else next.delete(id)
  visibleIds.value = [...next]
}

function showAllPages() {
  visibleIds.value = prototypePages.map((page) => page.id)
}

function hideAllPages() {
  visibleIds.value = []
}

function openSettings() {
  activeId.value = SYSTEM_PAGE_ID
  mobileOpen.value = false
}

function openPage(id: string) {
  if (!visibleIds.value.includes(id)) return false
  activeId.value = id
  mobileOpen.value = false
  return true
}

provide(workbenchNavigationKey, { openPage, openSettings })
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand-area">
        <button class="icon-button mobile-menu-button" aria-label="打开导航" @click="mobileOpen = true"><Menu /></button>
        <a class="brand" href="#" aria-label="回到系统设置" @click.prevent="openSettings">
          <svg class="brand-logo" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <rect width="36" height="36" rx="10" fill="url(#brand-gradient)" />
            <path d="M10 10.5h8.2a5.3 5.3 0 0 1 0 10.6H14V26h-4V10.5Zm4 3.6v3.5h3.7a1.75 1.75 0 1 0 0-3.5H14Z" fill="white" />
            <path d="M22 22.5 26 26l-4 3.5v-7Z" fill="#C7D2FE" />
            <defs><linearGradient id="brand-gradient" x1="3" y1="2" x2="34" y2="35"><stop stop-color="#6D5CE7" /><stop offset="1" stop-color="#3B82F6" /></linearGradient></defs>
          </svg>
          <span class="brand-copy"><strong>Prototype Workbench</strong><small>原型工作台</small></span>
        </a>
      </div>
      <span class="local-mode"><span />本地原型库</span>
    </header>

    <div class="app-body">
      <AppSidebar
        :pages="visiblePages"
        :active-id="activeId"
        :mobile-open="mobileOpen"
        @select="activeId = $event"
        @settings="openSettings"
        @close="mobileOpen = false"
      />

      <main class="content-area">
        <SystemSettings
          v-if="activeId === SYSTEM_PAGE_ID || !activePage"
          :pages="prototypePages"
          :visible-ids="visibleIds"
          @toggle-page="togglePage"
          @show-all="showAllPages"
          @hide-all="hideAllPages"
        />
        <div v-else-if="activePage" class="prototype-view">
          <Suspense>
            <component :is="activePage.component" />
            <template #fallback>
              <div class="page-loading"><span />正在载入页面</div>
            </template>
          </Suspense>
        </div>
      </main>
    </div>
  </div>
</template>
