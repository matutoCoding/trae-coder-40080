import type { Reagent, ReagentBatch } from '@/types/reagent'
import { getExpiryStatus, getExpiryDays } from '@/utils/dateUtils'
import { v4 as uuidv4 } from 'uuid'

export const reagentList: Reagent[] = [
  {
    id: 'reagent-001',
    name: 'DMEM高糖培养基',
    category: '培养基',
    specification: '500ml/瓶',
    unit: '瓶',
    manufacturer: 'Gibco',
    storageCondition: '2-8℃冷藏',
    totalStock: 25,
    availableStock: 25,
    expiringCount: 5,
    expiredCount: 0,
    createTime: '2025-01-01 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-002',
    name: '胎牛血清(FBS)',
    category: '试剂',
    specification: '500ml/瓶',
    unit: '瓶',
    manufacturer: 'HyClone',
    storageCondition: '-20℃冷冻',
    safetyLevel: '普通',
    totalStock: 18,
    availableStock: 18,
    expiringCount: 3,
    expiredCount: 1,
    createTime: '2025-01-02 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-003',
    name: '青霉素-链霉素溶液',
    category: '试剂',
    specification: '100ml/瓶',
    unit: '瓶',
    manufacturer: 'Sigma',
    storageCondition: '-20℃冷冻',
    totalStock: 40,
    availableStock: 40,
    expiringCount: 0,
    expiredCount: 0,
    createTime: '2025-01-03 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-004',
    name: '0.25%胰蛋白酶',
    category: '试剂',
    specification: '100ml/瓶',
    unit: '瓶',
    manufacturer: 'Gibco',
    storageCondition: '-20℃冷冻',
    totalStock: 12,
    availableStock: 12,
    expiringCount: 8,
    expiredCount: 0,
    createTime: '2025-01-04 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-005',
    name: 'PBS缓冲液',
    category: '试剂',
    specification: '500ml/瓶',
    unit: '瓶',
    manufacturer: 'Hyclone',
    storageCondition: '室温',
    totalStock: 50,
    availableStock: 50,
    expiringCount: 10,
    expiredCount: 2,
    createTime: '2025-01-05 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-006',
    name: '一次性无菌移液枪头',
    category: '耗材',
    specification: '1000ul/96支/盒',
    unit: '盒',
    manufacturer: 'Axygen',
    storageCondition: '室温',
    totalStock: 100,
    availableStock: 100,
    expiringCount: 0,
    expiredCount: 0,
    createTime: '2025-01-06 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-007',
    name: '一次性培养皿',
    category: '耗材',
    specification: '10cm/500个/箱',
    unit: '箱',
    manufacturer: 'Corning',
    storageCondition: '室温',
    totalStock: 20,
    availableStock: 20,
    expiringCount: 0,
    expiredCount: 0,
    createTime: '2025-01-07 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-008',
    name: 'Rabbit Anti-GAPDH抗体',
    category: '抗体',
    specification: '100ul/支',
    unit: '支',
    manufacturer: 'Cell Signaling',
    storageCondition: '-20℃冷冻',
    safetyLevel: '普通',
    totalStock: 15,
    availableStock: 15,
    expiringCount: 5,
    expiredCount: 0,
    createTime: '2025-01-08 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-009',
    name: 'DMSO细胞冻存液',
    category: '试剂',
    specification: '100ml/瓶',
    unit: '瓶',
    manufacturer: 'Sigma',
    storageCondition: '2-8℃冷藏',
    safetyLevel: '易燃',
    totalStock: 8,
    availableStock: 8,
    expiringCount: 2,
    expiredCount: 3,
    createTime: '2025-01-09 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'reagent-010',
    name: '75%医用酒精',
    category: '试剂',
    specification: '500ml/瓶',
    unit: '瓶',
    manufacturer: '国药集团',
    storageCondition: '室温',
    safetyLevel: '易燃',
    totalStock: 30,
    availableStock: 30,
    expiringCount: 0,
    expiredCount: 0,
    createTime: '2025-01-10 09:00:00',
    updateTime: '2025-06-18 10:00:00'
  }
]

const today = new Date('2025-06-18')

export const batchList: ReagentBatch[] = [
  {
    id: 'batch-001',
    reagentId: 'reagent-001',
    reagentName: 'DMEM高糖培养基',
    batchNo: '20250315',
    productionDate: '2025-03-15',
    expiryDate: '2026-03-15',
    quantity: 10,
    availableQuantity: 10,
    unit: '瓶',
    storageLocation: '冷藏室1号架',
    status: 'normal',
    expiryStatus: 'normal',
    expiryDays: 270,
    receiveDate: '2025-03-20',
    operator: '管理员',
    createTime: '2025-03-20 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-002',
    reagentId: 'reagent-001',
    reagentName: 'DMEM高糖培养基',
    batchNo: '20250110',
    productionDate: '2025-01-10',
    expiryDate: '2025-07-10',
    quantity: 5,
    availableQuantity: 5,
    unit: '瓶',
    storageLocation: '冷藏室1号架',
    status: 'normal',
    expiryStatus: 'expiring_30',
    expiryDays: 22,
    receiveDate: '2025-01-15',
    operator: '管理员',
    createTime: '2025-01-15 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-003',
    reagentId: 'reagent-001',
    reagentName: 'DMEM高糖培养基',
    batchNo: '20241205',
    productionDate: '2024-12-05',
    expiryDate: '2025-06-25',
    quantity: 10,
    availableQuantity: 10,
    unit: '瓶',
    storageLocation: '冷藏室1号架',
    status: 'normal',
    expiryStatus: 'expiring_7',
    expiryDays: 7,
    receiveDate: '2024-12-10',
    operator: '管理员',
    createTime: '2024-12-10 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-004',
    reagentId: 'reagent-002',
    reagentName: '胎牛血清(FBS)',
    batchNo: 'AES2543',
    productionDate: '2024-08-20',
    expiryDate: '2025-06-15',
    quantity: 1,
    availableQuantity: 1,
    unit: '瓶',
    storageLocation: '冷冻室2号架',
    status: 'locked',
    expiryStatus: 'expired',
    expiryDays: -3,
    receiveDate: '2024-09-01',
    operator: '管理员',
    remarks: '已过期，自动锁定',
    createTime: '2024-09-01 10:00:00',
    updateTime: '2025-06-16 00:00:00'
  },
  {
    id: 'batch-005',
    reagentId: 'reagent-002',
    reagentName: '胎牛血清(FBS)',
    batchNo: 'AES2678',
    productionDate: '2025-01-15',
    expiryDate: '2025-12-15',
    quantity: 10,
    availableQuantity: 10,
    unit: '瓶',
    storageLocation: '冷冻室2号架',
    status: 'normal',
    expiryStatus: 'normal',
    expiryDays: 180,
    receiveDate: '2025-02-01',
    operator: '管理员',
    createTime: '2025-02-01 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-006',
    reagentId: 'reagent-002',
    reagentName: '胎牛血清(FBS)',
    batchNo: 'AES2712',
    productionDate: '2025-03-10',
    expiryDate: '2025-07-10',
    quantity: 3,
    availableQuantity: 3,
    unit: '瓶',
    storageLocation: '冷冻室2号架',
    status: 'normal',
    expiryStatus: 'expiring_30',
    expiryDays: 22,
    receiveDate: '2025-03-15',
    operator: '管理员',
    createTime: '2025-03-15 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-007',
    reagentId: 'reagent-004',
    reagentName: '0.25%胰蛋白酶',
    batchNo: 'TRY250412',
    productionDate: '2025-04-12',
    expiryDate: '2025-07-12',
    quantity: 8,
    availableQuantity: 8,
    unit: '瓶',
    storageLocation: '冷冻室3号架',
    status: 'normal',
    expiryStatus: 'expiring_30',
    expiryDays: 24,
    receiveDate: '2025-04-15',
    operator: '管理员',
    createTime: '2025-04-15 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-008',
    reagentId: 'reagent-004',
    reagentName: '0.25%胰蛋白酶',
    batchNo: 'TRY250501',
    productionDate: '2025-05-01',
    expiryDate: '2025-06-25',
    quantity: 4,
    availableQuantity: 4,
    unit: '瓶',
    storageLocation: '冷冻室3号架',
    status: 'normal',
    expiryStatus: 'expiring_7',
    expiryDays: 7,
    receiveDate: '2025-05-05',
    operator: '管理员',
    createTime: '2025-05-05 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-009',
    reagentId: 'reagent-005',
    reagentName: 'PBS缓冲液',
    batchNo: 'PBS20241101',
    productionDate: '2024-11-01',
    expiryDate: '2025-06-10',
    quantity: 2,
    availableQuantity: 2,
    unit: '瓶',
    storageLocation: '常温区A区',
    status: 'locked',
    expiryStatus: 'expired',
    expiryDays: -8,
    receiveDate: '2024-11-05',
    operator: '管理员',
    remarks: '已过期，自动锁定',
    createTime: '2024-11-05 10:00:00',
    updateTime: '2025-06-11 00:00:00'
  },
  {
    id: 'batch-010',
    reagentId: 'reagent-005',
    reagentName: 'PBS缓冲液',
    batchNo: 'PBS20250320',
    productionDate: '2025-03-20',
    expiryDate: '2026-03-20',
    quantity: 30,
    availableQuantity: 30,
    unit: '瓶',
    storageLocation: '常温区A区',
    status: 'normal',
    expiryStatus: 'normal',
    expiryDays: 275,
    receiveDate: '2025-03-25',
    operator: '管理员',
    createTime: '2025-03-25 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-011',
    reagentId: 'reagent-008',
    reagentName: 'Rabbit Anti-GAPDH抗体',
    batchNo: 'AB250612',
    productionDate: '2025-02-12',
    expiryDate: '2025-07-12',
    quantity: 5,
    availableQuantity: 5,
    unit: '支',
    storageLocation: '冷冻室1号架',
    status: 'normal',
    expiryStatus: 'expiring_30',
    expiryDays: 24,
    receiveDate: '2025-02-15',
    operator: '管理员',
    createTime: '2025-02-15 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-012',
    reagentId: 'reagent-009',
    reagentName: 'DMSO细胞冻存液',
    batchNo: 'DMS20231201',
    productionDate: '2023-12-01',
    expiryDate: '2025-06-01',
    quantity: 3,
    availableQuantity: 3,
    unit: '瓶',
    storageLocation: '冷藏室2号架',
    status: 'locked',
    expiryStatus: 'expired',
    expiryDays: -17,
    receiveDate: '2023-12-10',
    operator: '管理员',
    remarks: '已过期，自动锁定',
    createTime: '2023-12-10 10:00:00',
    updateTime: '2025-06-02 00:00:00'
  },
  {
    id: 'batch-013',
    reagentId: 'reagent-009',
    reagentName: 'DMSO细胞冻存液',
    batchNo: 'DMS20250115',
    productionDate: '2025-01-15',
    expiryDate: '2025-07-15',
    quantity: 2,
    availableQuantity: 2,
    unit: '瓶',
    storageLocation: '冷藏室2号架',
    status: 'normal',
    expiryStatus: 'expiring_30',
    expiryDays: 27,
    receiveDate: '2025-01-20',
    operator: '管理员',
    createTime: '2025-01-20 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-014',
    reagentId: 'reagent-009',
    reagentName: 'DMSO细胞冻存液',
    batchNo: 'DMS20250301',
    productionDate: '2025-03-01',
    expiryDate: '2026-03-01',
    quantity: 3,
    availableQuantity: 3,
    unit: '瓶',
    storageLocation: '冷藏室2号架',
    status: 'normal',
    expiryStatus: 'normal',
    expiryDays: 256,
    receiveDate: '2025-03-05',
    operator: '管理员',
    createTime: '2025-03-05 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  },
  {
    id: 'batch-015',
    reagentId: 'reagent-003',
    reagentName: '青霉素-链霉素溶液',
    batchNo: 'PS20250401',
    productionDate: '2025-04-01',
    expiryDate: '2026-04-01',
    quantity: 40,
    availableQuantity: 40,
    unit: '瓶',
    storageLocation: '冷冻室3号架',
    status: 'normal',
    expiryStatus: 'normal',
    expiryDays: 287,
    receiveDate: '2025-04-05',
    operator: '管理员',
    createTime: '2025-04-05 10:00:00',
    updateTime: '2025-06-18 10:00:00'
  }
]

export const getReagentById = (id: string): Reagent | undefined => {
  return reagentList.find(reagent => reagent.id === id)
}

export const getBatchesByReagentId = (reagentId: string): ReagentBatch[] => {
  return batchList.filter(batch => batch.reagentId === reagentId)
}

export const getAvailableBatchesByReagentId = (reagentId: string): ReagentBatch[] => {
  return batchList.filter(
    batch => batch.reagentId === reagentId && 
    batch.status === 'normal' && 
    batch.availableQuantity > 0
  ).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
}

export const getExpiringBatches = (): ReagentBatch[] => {
  return batchList.filter(
    batch => batch.expiryStatus !== 'normal' && batch.expiryStatus !== 'expired'
  )
}

export const getExpiredBatches = (): ReagentBatch[] => {
  return batchList.filter(batch => batch.expiryStatus === 'expired')
}

export const addBatch = (data: Omit<ReagentBatch, 'id' | 'expiryStatus' | 'expiryDays' | 'createTime' | 'updateTime' | 'status'>): ReagentBatch => {
  const expiryStatus = getExpiryStatus(data.expiryDate)
  const expiryDays = getExpiryDays(data.expiryDate)
  
  const newBatch: ReagentBatch = {
    ...data,
    id: uuidv4(),
    status: expiryStatus === 'expired' ? 'locked' : 'normal',
    expiryStatus,
    expiryDays,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
  
  batchList.unshift(newBatch)
  
  const reagent = reagentList.find(r => r.id === data.reagentId)
  if (reagent) {
    reagent.totalStock += data.quantity
    reagent.availableStock += data.quantity
    if (expiryStatus === 'expired') {
      reagent.expiredCount += data.quantity
    } else if (expiryStatus !== 'normal') {
      reagent.expiringCount += data.quantity
    }
  }
  
  console.log('[Batch] 新增批次:', newBatch.batchNo, newBatch.reagentName)
  return newBatch
}

export const updateBatchStatus = (batchId: string, status: ReagentBatch['status']): boolean => {
  const batch = batchList.find(b => b.id === batchId)
  if (batch) {
    batch.status = status
    batch.updateTime = new Date().toISOString()
    console.log('[Batch] 更新批次状态:', batchId, '→', status)
    return true
  }
  return false
}

export const checkAndLockExpiredBatches = (): number => {
  let lockedCount = 0
  batchList.forEach(batch => {
    if (batch.status === 'normal') {
      const expiryStatus = getExpiryStatus(batch.expiryDate)
      const expiryDays = getExpiryDays(batch.expiryDate)
      batch.expiryStatus = expiryStatus
      batch.expiryDays = expiryDays
      
      if (expiryStatus === 'expired') {
        batch.status = 'locked'
        batch.remarks = '已过期，自动锁定'
        lockedCount++
        console.log('[Batch] 自动锁定过期批次:', batch.batchNo, batch.reagentName)
        
        const reagent = reagentList.find(r => r.id === batch.reagentId)
        if (reagent) {
          reagent.expiredCount += batch.availableQuantity
          reagent.expiringCount = Math.max(0, reagent.expiringCount - batch.availableQuantity)
        }
      }
    }
  })
  return lockedCount
}
