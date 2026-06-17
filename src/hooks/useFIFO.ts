import { useMemo } from 'react'
import { getFIFORecommendation } from '@/data/outboundData'
import { reagentList } from '@/data/reagentData'
import type { FIFORecommendation } from '@/types/outbound'
import type { Reagent } from '@/types/reagent'

export const useFIFO = (reagentId?: string, requestedQuantity?: number): {
  recommendation: FIFORecommendation | null
  isLoading: boolean
  error: string | null
  lowStockReagents: Reagent[]
  fifoComplianceRate: number
} => {
  const result = useMemo(() => {
    const lowStockReagents = reagentList.filter(r => r.availableStock < 10)
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

    try {
      const recommendation = getFIFORecommendation(reagentId, requestedQuantity)
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
        lowStockReagents,
        fifoComplianceRate
      }
    }
  }, [reagentId, requestedQuantity])

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
  const result = useMemo(() => {
    if (!reagentId || !batchId || requestedQuantity <= 0) {
      return {
        isValid: true,
        message: '',
        shouldWarn: false,
        warningMessage: ''
      }
    }

    const recommendation = getFIFORecommendation(reagentId, requestedQuantity)
    
    const isFIFOBatch = recommendation.batches.some(b => b.batchId === batchId)
    
    if (!isFIFOBatch) {
      const firstBatch = recommendation.batches[0]
      if (firstBatch) {
        return {
          isValid: false,
          message: `不符合先进先出原则，请优先使用批次${firstBatch.batchNo}（有效期${firstBatch.expiryDate}）`,
          shouldWarn: true,
          warningMessage: `建议优先使用更早过期的批次${firstBatch.batchNo}，剩余${firstBatch.availableQuantity}${recommendation.batches[0]?.expiryDate ? '' : ''}`
        }
      }
    }

    return {
      isValid: true,
      message: '',
      shouldWarn: false,
      warningMessage: ''
    }
  }, [reagentId, batchId, requestedQuantity])

  return result
}
