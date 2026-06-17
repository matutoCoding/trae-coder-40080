export type ReagentCategory = '试剂' | '耗材' | '培养基' | '抗体' | '其他'

export type ExpiryStatus = 'normal' | 'expiring_30' | 'expiring_15' | 'expiring_7' | 'expired'

export type BatchStatus = 'normal' | 'locked' | 'depleted'

export interface Reagent {
  id: string
  name: string
  category: ReagentCategory
  specification: string
  unit: string
  manufacturer: string
  storageCondition: string
  safetyLevel?: string
  remarks?: string
  totalStock: number
  availableStock: number
  expiringCount: number
  expiredCount: number
  createTime: string
  updateTime: string
}

export interface ReagentBatch {
  id: string
  reagentId: string
  reagentName: string
  batchNo: string
  productionDate: string
  expiryDate: string
  quantity: number
  availableQuantity: number
  unit: string
  storageLocation: string
  status: BatchStatus
  expiryStatus: ExpiryStatus
  expiryDays: number
  receiveDate: string
  operator: string
  remarks?: string
  createTime: string
  updateTime: string
}

export interface BatchInboundForm {
  reagentId: string
  batchNo: string
  productionDate: string
  expiryDate: string
  quantity: number
  storageLocation: string
  operator: string
  remarks?: string
}
