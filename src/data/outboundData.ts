import type { OutboundRecord, OutboundFormData, FIFORecommendation, OutboundItem } from '@/types/outbound'
import { getAvailableBatchesByReagentId, getReagentById, updateBatchStatus, batchList } from './reagentData'
import { v4 as uuidv4 } from 'uuid'

export const outboundRecords: OutboundRecord[] = [
  {
    id: 'outbound-001',
    outboundNo: 'OB20250618001',
    researchGroup: '肿瘤生物学课题组',
    receiver: '张三',
    receiverPhone: '13800138001',
    purpose: '细胞培养实验',
    totalItems: 3,
    totalQuantity: 7,
    status: 'completed',
    operator: '管理员',
    outboundTime: '2025-06-18 09:30:00',
    items: [
      {
        id: 'item-001',
        outboundId: 'outbound-001',
        reagentId: 'reagent-001',
        reagentName: 'DMEM高糖培养基',
        batchId: 'batch-003',
        batchNo: '20241205',
        quantity: 2,
        unit: '瓶',
        expiryDate: '2025-06-25'
      },
      {
        id: 'item-002',
        outboundId: 'outbound-001',
        reagentId: 'reagent-002',
        reagentName: '胎牛血清(FBS)',
        batchId: 'batch-006',
        batchNo: 'AES2712',
        quantity: 1,
        unit: '瓶',
        expiryDate: '2025-07-10'
      },
      {
        id: 'item-003',
        outboundId: 'outbound-001',
        reagentId: 'reagent-003',
        reagentName: '青霉素-链霉素溶液',
        batchId: 'batch-015',
        batchNo: 'PS20250401',
        quantity: 4,
        unit: '瓶',
        expiryDate: '2026-04-01'
      }
    ],
    createTime: '2025-06-18 09:30:00'
  },
  {
    id: 'outbound-002',
    outboundNo: 'OB20250617001',
    researchGroup: '免疫学课题组',
    receiver: '李四',
    receiverPhone: '13800138002',
    purpose: 'Western Blot实验',
    totalItems: 2,
    totalQuantity: 6,
    status: 'completed',
    operator: '管理员',
    outboundTime: '2025-06-17 14:00:00',
    items: [
      {
        id: 'item-004',
        outboundId: 'outbound-002',
        reagentId: 'reagent-005',
        reagentName: 'PBS缓冲液',
        batchId: 'batch-010',
        batchNo: 'PBS20250320',
        quantity: 5,
        unit: '瓶',
        expiryDate: '2026-03-20'
      },
      {
        id: 'item-005',
        outboundId: 'outbound-002',
        reagentId: 'reagent-008',
        reagentName: 'Rabbit Anti-GAPDH抗体',
        batchId: 'batch-011',
        batchNo: 'AB250612',
        quantity: 1,
        unit: '支',
        expiryDate: '2025-07-12'
      }
    ],
    createTime: '2025-06-17 14:00:00'
  },
  {
    id: 'outbound-003',
    outboundNo: 'OB20250616001',
    researchGroup: '神经生物学课题组',
    receiver: '王五',
    receiverPhone: '13800138003',
    purpose: '细胞传代',
    totalItems: 2,
    totalQuantity: 12,
    status: 'completed',
    operator: '管理员',
    outboundTime: '2025-06-16 10:00:00',
    items: [
      {
        id: 'item-006',
        outboundId: 'outbound-003',
        reagentId: 'reagent-004',
        reagentName: '0.25%胰蛋白酶',
        batchId: 'batch-008',
        batchNo: 'TRY250501',
        quantity: 2,
        unit: '瓶',
        expiryDate: '2025-06-25'
      },
      {
        id: 'item-007',
        outboundId: 'outbound-003',
        reagentId: 'reagent-006',
        reagentName: '一次性无菌移液枪头',
        batchId: 'batch-016',
        batchNo: 'TIP20250101',
        quantity: 10,
        unit: '盒',
        expiryDate: '2027-01-01'
      }
    ],
    createTime: '2025-06-16 10:00:00'
  }
]

export const getFIFORecommendation = (reagentId: string, requestedQuantity: number): FIFORecommendation => {
  const availableBatches = getAvailableBatchesByReagentId(reagentId)
  const reagent = getReagentById(reagentId)
  
  let remainingQuantity = requestedQuantity
  const allocatedBatches: FIFORecommendation['batches'] = []
  let totalAvailable = 0
  
  for (const batch of availableBatches) {
    totalAvailable += batch.availableQuantity
    
    if (remainingQuantity <= 0) break
    
    const allocateQty = Math.min(remainingQuantity, batch.availableQuantity)
    
    if (allocateQty > 0) {
      allocatedBatches.push({
        batchId: batch.id,
        batchNo: batch.batchNo,
        expiryDate: batch.expiryDate,
        expiryDays: batch.expiryDays,
        availableQuantity: batch.availableQuantity,
        allocatedQuantity: allocateQty
      })
      
      remainingQuantity -= allocateQty
    }
  }
  
  console.log('[FIFO] 先进先出分配:', reagent?.name, '请求:', requestedQuantity, '分配:', allocatedBatches)
  
  return {
    reagentId,
    reagentName: reagent?.name || '',
    requestedQuantity,
    availableQuantity: totalAvailable,
    batches: allocatedBatches,
    isSufficient: remainingQuantity <= 0
  }
}

export const createOutbound = (formData: OutboundFormData): OutboundRecord | null => {
  const items: OutboundItem[] = []
  let totalQuantity = 0
  
  for (const formItem of formData.items) {
    const recommendation = getFIFORecommendation(formItem.reagentId, formItem.quantity)
    
    if (!recommendation.isSufficient) {
      console.error('[Outbound] 库存不足:', formItem.reagentName)
      return null
    }
    
    for (const batchAlloc of recommendation.batches) {
      const item: OutboundItem = {
        id: uuidv4(),
        outboundId: '',
        reagentId: formItem.reagentId,
        reagentName: formItem.reagentName,
        batchId: batchAlloc.batchId,
        batchNo: batchAlloc.batchNo,
        quantity: batchAlloc.allocatedQuantity,
        unit: formItem.unit,
        expiryDate: batchAlloc.expiryDate
      }
      items.push(item)
      totalQuantity += batchAlloc.allocatedQuantity
    }
  }
  
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
  const seqNo = (outboundRecords.filter(r => r.outboundNo.includes(dateStr)).length + 1).toString().padStart(3, '0')
  
  const outboundRecord: OutboundRecord = {
    id: uuidv4(),
    outboundNo: `OB${dateStr}${seqNo}`,
    researchGroup: formData.researchGroup,
    receiver: formData.receiver,
    receiverPhone: formData.receiverPhone,
    purpose: formData.purpose,
    totalItems: items.length,
    totalQuantity,
    status: 'completed',
    operator: '管理员',
    outboundTime: now.toISOString(),
    remarks: formData.remarks,
    items,
    createTime: now.toISOString()
  }
  
  items.forEach(item => {
    item.outboundId = outboundRecord.id
  })
  
  outboundRecords.unshift(outboundRecord)
  
  for (const item of items) {
    const batch = batchList.find((b: any) => b.id === item.batchId)
    if (batch) {
      batch.availableQuantity -= item.quantity
      batch.updateTime = new Date().toISOString()
      
      if (batch.availableQuantity === 0) {
        updateBatchStatus(batch.id, 'depleted')
      }
    }
    
    const reagent = getReagentById(item.reagentId)
    if (reagent) {
      reagent.availableStock -= item.quantity
      reagent.totalStock -= item.quantity
      if (batch && batch.expiryStatus !== 'normal' && batch.expiryStatus !== 'expired') {
        reagent.expiringCount = Math.max(0, reagent.expiringCount - item.quantity)
      }
    }
  }
  
  console.log('[Outbound] 创建出库单:', outboundRecord.outboundNo, '共', items.length, '项')
  return outboundRecord
}

export const getOutboundById = (id: string): OutboundRecord | undefined => {
  return outboundRecords.find(record => record.id === id)
}

export const getOutboundByNo = (outboundNo: string): OutboundRecord | undefined => {
  return outboundRecords.find(record => record.outboundNo === outboundNo)
}
