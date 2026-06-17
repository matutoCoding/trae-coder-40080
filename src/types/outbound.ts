export type OutboundStatus = 'pending' | 'completed' | 'cancelled'

export interface OutboundItem {
  id: string
  outboundId: string
  reagentId: string
  reagentName: string
  batchId: string
  batchNo: string
  quantity: number
  unit: string
  expiryDate: string
  unitPrice?: number
}

export interface OutboundRecord {
  id: string
  outboundNo: string
  researchGroup: string
  receiver: string
  receiverPhone: string
  purpose: string
  totalItems: number
  totalQuantity: number
  status: OutboundStatus
  operator: string
  outboundTime: string
  remarks?: string
  items: OutboundItem[]
  createTime: string
}

export interface OutboundFormData {
  researchGroup: string
  receiver: string
  receiverPhone: string
  purpose: string
  items: {
    reagentId: string
    reagentName: string
    quantity: number
    unit: string
  }[]
  remarks?: string
}

export interface FIFORecommendation {
  reagentId: string
  reagentName: string
  requestedQuantity: number
  availableQuantity: number
  batches: {
    batchId: string
    batchNo: string
    expiryDate: string
    expiryDays: number
    availableQuantity: number
    allocatedQuantity: number
  }[]
  isSufficient: boolean
}
