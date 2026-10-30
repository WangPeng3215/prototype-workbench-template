export type PrototypeStatus = 'draft' | 'in-progress' | 'in-review' | 'accepted' | 'archived'

export interface RequirementPrototype {
  requirementId: string
  requirementName: string
  status: PrototypeStatus
  summary: string
  owner: string
  pageCount: number
  updatedAt: string
}
