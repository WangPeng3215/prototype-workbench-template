<script setup lang="ts">
import { computed } from 'vue'
import type { PrototypeStatus } from '../types/prototype'

const props = defineProps<{ status: PrototypeStatus }>()

const labels: Record<PrototypeStatus, string> = {
  draft: '草稿',
  'in-progress': '进行中',
  'in-review': '待验收',
  accepted: '已验收',
  archived: '已归档',
}

const label = computed(() => labels[props.status])
</script>

<template>
  <span class="status-tag" :class="`is-${status}`">
    <i aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  white-space: nowrap;
}

.status-tag i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.is-draft {
  background: var(--info-soft);
  color: var(--info);
}

.is-in-progress {
  background: var(--primary-soft);
  color: var(--primary);
}

.is-in-review {
  background: var(--warning-soft);
  color: var(--warning);
}

.is-accepted {
  background: var(--success-soft);
  color: var(--success);
}

.is-archived {
  background: var(--info-soft);
  color: var(--text-tertiary);
}
</style>
