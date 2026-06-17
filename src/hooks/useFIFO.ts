import { useMemo } from 'react'
import { useReagentStore } from '@/store/useReagentStore'
import type { FIFORecommendation } from '@/types/outbound'
import type { Reagent, ReagentBatch } from '@/types/reagent'

export const useFIFO = (reagentId?: string, requestedQuantity?: number): {
  recommendation: FIFORecommendation | null
  isLoading: boolean
  error: string | null
  lowStockReagents: Reagent[]
  fifoComplianceRate: number
} => {
  const reagents = useReagentStore(state => state.reagents)
  const batches = useReagentStore(state => state.batches)

  const result = useMemo(() => {
    try {
      const lowStockReagents = reagents.filter(r => {
        const availableBatches = batches.filter(
          b => b.reagentId === r.id && b.status === 'normal' && b.availableQuantity > 0
        )
        const availableStock = availableBatches.reduce((sum, b) => sum + b.availableQuantity, 0)
        return availableStock < 10
      })
      const fifoComplianceRate = 100

      if (!reagentId || !requestedQuantity || requestedQuantity <= 0) {
        return {
          recommendation: null,
          isLoading: false,
          error: null,
          lowStockReagents,
          fifoComplianceRate
        }
      }

      const availableBatches = batches
        .filter(
          batch => batch.reagentId === reagentId && 
          batch.status === 'normal' && 
          batch.availableQuantity > 0
        )
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

      const reagent = reagents.find(r => r.id === reagentId)
      
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
      
      console.log('[FIFO] 先进先出分配:', reagent?.name, '请求:', requestedQuantity, '可用:', totalAvailable, '分配:', allocatedBatches.length, '个批次')
      
      const recommendation: FIFORecommendation = {
        reagentId,
        reagentName: reagent?.name || '',
        requestedQuantity,
        availableQuantity: totalAvailable,
        batches: allocatedBatches,
        isSufficient: remainingQuantity <= 0
      }

      return {
        recommendation,
        isLoading: false,
        error: null,
        lowStockReagents,
        fifoComplianceRate
      }
    } catch (error) {
      console.error('[useFIFO] 获取FIFO推荐失败:', error)
      return {
        recommendation: null,
        isLoading: false,
        error: '获取出库推荐失败',
        lowStockReagents: [],
        fifoComplianceRate: 100
      }
    }
  }, [reagentId, requestedQuantity, reagents, batches])

  return result
}

export const useBatchFIFOValidation = (
  reagentId: string,
  batchId: string,
  requestedQuantity: number
): {
  isValid: boolean
  message: string
  shouldWarn: boolean
  warningMessage: string
} => {
  const batches = useReagentStore(state => state.batches)

  const result = useMemo(() => {
    try {
      if (!reagentId || !batchId || requestedQuantity <= 0) {
        return {
          isValid: true,
          message: '',
          shouldWarn: false,
          warningMessage: ''
        }
      }

      const availableBatches = batches
        .filter(
          b => b.reagentId === reagentId && 
          b.status === 'normal' && 
          b.availableQuantity > 0
        )
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

      const isFIFOBatch = availableBatches.slice(0, 3).some(b => b.id === batchId)
      
      if (!isFIFOBatch && availableBatches.length > 0) {
        const firstBatch = availableBatches[0]
        return {
          isValid: false,
          message: `不符合先进先出原则，请优先使用批次${firstBatch.batchNo}（有效期${firstBatch.expiryDate}）`,
          shouldWarn: true,
          warningMessage: `建议优先使用更早过期的批次${firstBatch.batchNo}`
        }
      }

      return {
        isValid: true,
        message: '',
        shouldWarn: false,
        warningMessage: ''
      }
    } catch (error) {
      console.error('[useBatchFIFOValidation] 验证出错:', error)
      return {
        isValid: true,
        message: '',
        shouldWarn: false,
        warningMessage: ''
      }
    }
  }, [reagentId, batchId, requestedQuantity, batches])

  return result
}
