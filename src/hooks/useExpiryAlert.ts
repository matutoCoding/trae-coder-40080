import { useMemo, useEffect } from 'react'
import { getExpiringBatches, getExpiredBatches, checkAndLockExpiredBatches } from '@/data/reagentData'
import type { ReagentBatch } from '@/types/reagent'

export const useExpiryAlert = () => {
  useEffect(() => {
    const lockedCount = checkAndLockExpiredBatches()
    if (lockedCount > 0) {
      console.log(`[ExpiryAlert] 自动锁定了${lockedCount}个过期批次`)
    }
  }, [])

  const result = useMemo(() => {
    const expiringBatches = getExpiringBatches()
    const expiredBatches = getExpiredBatches()

    const groupedByDays = {
      expiring7: expiringBatches.filter(b => b.expiryStatus === 'expiring_7'),
      expiring15: expiringBatches.filter(b => b.expiryStatus === 'expiring_15'),
      expiring30: expiringBatches.filter(b => b.expiryStatus === 'expiring_30')
    }

    const totalExpiring = expiringBatches.reduce((sum, b) => sum + b.availableQuantity, 0)
    const totalExpired = expiredBatches.reduce((sum, b) => sum + b.availableQuantity, 0)

    const alerts: {
      level: 'critical' | 'warning' | 'info'
      title: string
      count: number
      quantity: number
      batches: ReagentBatch[]
    }[] = []

    if (groupedByDays.expiring7.length > 0) {
      alerts.push({
        level: 'critical',
        title: '7天内到期',
        count: groupedByDays.expiring7.length,
        quantity: groupedByDays.expiring7.reduce((sum, b) => sum + b.availableQuantity, 0),
        batches: groupedByDays.expiring7
      })
    }

    if (groupedByDays.expiring15.length > 0) {
      alerts.push({
        level: 'warning',
        title: '15天内到期',
        count: groupedByDays.expiring15.length,
        quantity: groupedByDays.expiring15.reduce((sum, b) => sum + b.availableQuantity, 0),
        batches: groupedByDays.expiring15
      })
    }

    if (groupedByDays.expiring30.length > 0) {
      alerts.push({
        level: 'warning',
        title: '30天内到期',
        count: groupedByDays.expiring30.length,
        quantity: groupedByDays.expiring30.reduce((sum, b) => sum + b.availableQuantity, 0),
        batches: groupedByDays.expiring30
      })
    }

    if (expiredBatches.length > 0) {
      alerts.unshift({
        level: 'critical',
        title: '已过期',
        count: expiredBatches.length,
        quantity: totalExpired,
        batches: expiredBatches
      })
    }

    return {
      expiringBatches,
      expiredBatches,
      groupedByDays,
      totalExpiring,
      totalExpired,
      alerts,
      hasAlerts: alerts.length > 0
    }
  }, [])

  return result
}

export const useReagentExpiryStatus = (reagentId: string) => {
  const result = useMemo(() => {
    const expiringBatches = getExpiringBatches().filter(b => b.reagentId === reagentId)
    const expiredBatches = getExpiredBatches().filter(b => b.reagentId === reagentId)

    let status: 'normal' | 'expiring' | 'expired' = 'normal'
    let message = ''

    if (expiredBatches.length > 0) {
      status = 'expired'
      message = `有${expiredBatches.length}个批次已过期，已锁定`
    } else if (expiringBatches.length > 0) {
      status = 'expiring'
      const minDays = Math.min(...expiringBatches.map(b => b.expiryDays))
      message = `有${expiringBatches.length}个批次将在${minDays}天内到期`
    }

    return {
      status,
      message,
      expiringBatches,
      expiredBatches
    }
  }, [reagentId])

  return result
}
