import { inject, type InjectionKey } from 'vue'

export interface WorkbenchNavigation {
  openPage: (id: string) => boolean
  openSettings: () => void
}

export const workbenchNavigationKey: InjectionKey<WorkbenchNavigation> = Symbol('workbench-navigation')

const fallback: WorkbenchNavigation = {
  openPage: () => false,
  openSettings: () => {},
}

export function useWorkbenchNavigation(): WorkbenchNavigation {
  return inject(workbenchNavigationKey, fallback)
}
