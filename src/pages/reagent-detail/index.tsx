import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import BatchItem from '@/components/BatchItem'
import { useReagentStore } from '@/store/useReagentStore'
import { useExpiryAlert } from '@/hooks/useExpiryAlert'
import { getExpiryStatusText } from '@/utils/dateUtils'
import styles from './index.module.scss'

const ReagentDetailPage: React.FC = () => {
  const router = useRouter()
  const reagentId = router.params.id as string

  const {
    getReagentById,
    getBatchesByReagentId,
    checkExpiredBatches,
    setSelectedReagent
  } = useReagentStore()

  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'expiring' | 'expired'>('all')

  useDidShow(() => {
    checkExpiredBatches()
  })

  const reagent = useMemo(() => getReagentById(reagentId), [reagentId])
  const batches = useMemo(() => getBatchesByReagentId(reagentId), [reagentId])

  const filteredBatches = useMemo(() => {
    if (filterStatus === 'all') return batches
    if (filterStatus === 'normal') return batches.filter(b => b.expiryStatus === 'normal')
    if (filterStatus === 'expiring') return batches.filter(b =>
      b.expiryStatus === 'expiring_30' || b.expiryStatus === 'expiring_15' || b.expiryStatus === 'expiring_7'
    )
    if (filterStatus === 'expired') return batches.filter(b => b.expiryStatus === 'expired' || b.status === 'locked')
    return batches
  }, [batches, filterStatus])

  const stats = useMemo(() => {
    const normal = batches.filter(b => b.expiryStatus === 'normal').length
    const expiring = batches.filter(b =>
      b.expiryStatus === 'expiring_30' || b.expiryStatus === 'expiring_15' || b.expiryStatus === 'expiring_7'
    ).length
    const expired = batches.filter(b => b.expiryStatus === 'expired' || b.status === 'locked').length
    const totalQty = batches.reduce((sum, b) => sum + b.availableQuantity, 0)
    return { normal, expiring, expired, totalQty }
  }, [batches])

  const handleInbound = () => {
    Taro.navigateTo({
      url: `/pages/batch-inbound/index?reagentId=${reagentId}`
    })
  }

  const handleOutbound = () => {
    Taro.navigateTo({
      url: `/pages/outbound-confirm/index?reagentId=${reagentId}`
    })
  }

  if (!reagent) {
    return (
      <View className={styles.emptyState}>
        <Text className={styles.emptyIcon}>🧪</Text>
        <Text className={styles.emptyText}>试剂信息不存在</Text>
      </View>
    )
  }

  const expiryStatusType = (): any => {
    if (reagent.expiredCount > 0) return 'expired'
    if (reagent.expiringCount > 0) return 'expiring_7'
    return 'normal'
  }

  const expiryStatusText = (): string => {
    if (reagent.expiredCount > 0) return '有过期'
    if (reagent.expiringCount > 0) return '有临期'
    return '正常'
  }

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.header}>
        <View className={styles.headerRow}>
          <View className={styles.nameRow}>
            <Text className={styles.reagentName}>{reagent.name}</Text>
            <StatusTag type={expiryStatusType()} text={expiryStatusText()} size="sm" />
          </View>
          <View className={styles.categoryTag}>
            <Text className={styles.categoryText}>{reagent.category}</Text>
          </View>
        </View>
        <Text className={styles.specText}>{reagent.specification}</Text>
        <Text className={styles.mfgText}>生产厂家：{reagent.manufacturer}</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{stats.totalQty}</Text>
          <Text className={styles.statLabel}>总库存({reagent.unit})</Text>
        </View>
        <View className={classnames(styles.statCard, styles.normal)}>
          <Text className={styles.statValue}>{stats.normal}</Text>
          <Text className={styles.statLabel}>正常批次</Text>
        </View>
        <View className={classnames(styles.statCard, styles.warning)}>
          <Text className={styles.statValue}>{stats.expiring}</Text>
          <Text className={styles.statLabel}>临期批次</Text>
        </View>
        <View className={classnames(styles.statCard, styles.danger)}>
          <Text className={styles.statValue}>{stats.expired}</Text>
          <Text className={styles.statLabel}>过期批次</Text>
        </View>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>基本信息</Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>存储条件</Text>
            <Text className={styles.infoValue}>{reagent.storageCondition}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>安全等级</Text>
            <Text className={styles.infoValue}>{reagent.safetyLevel || '普通'}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>总库存</Text>
            <Text className={classnames(
              styles.infoValue,
              styles.stockValue,
              reagent.availableStock < 10 && styles.lowStock
            )}>
              {reagent.availableStock} {reagent.unit}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>批次总数</Text>
            <Text className={styles.infoValue}>{batches.length} 批</Text>
          </View>
        </View>

        {(reagent.expiringCount > 0 || reagent.expiredCount > 0) && (
          <View className={styles.alertRow}>
            {reagent.expiringCount > 0 && (
              <View className={classnames(styles.alertItem, styles.warning)}>
                <Text className={styles.alertIcon}>⚠</Text>
                <Text className={styles.alertText}>
                  临期 {reagent.expiringCount} {reagent.unit}
                </Text>
              </View>
            )}
            {reagent.expiredCount > 0 && (
              <View className={classnames(styles.alertItem, styles.danger)}>
                <Text className={styles.alertIcon}>✕</Text>
                <Text className={styles.alertText}>
                  过期 {reagent.expiredCount} {reagent.unit}（已锁定）
                </Text>
              </View>
            )}
          </View>
        )}

        {reagent.remarks && (
          <View className={styles.remarks}>
            <Text className={styles.remarksLabel}>备注</Text>
            <Text className={styles.remarksText}>{reagent.remarks}</Text>
          </View>
        )}
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.cardTitle}>批次列表 ({filteredBatches.length})</Text>
        </View>

        <View className={styles.filterTabs}>
          {[
            { value: 'all', label: '全部' },
            { value: 'normal', label: '正常' },
            { value: 'expiring', label: '临期' },
            { value: 'expired', label: '过期/锁定' }
          ].map(tab => (
            <View
              key={tab.value}
              className={classnames(
                styles.filterTab,
                filterStatus === tab.value && styles.active
              )}
              onClick={() => setFilterStatus(tab.value as any)}
            >
              <Text className={styles.filterTabText}>{tab.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.batchList}>
          {filteredBatches.length > 0 ? (
            filteredBatches.map(batch => (
              <BatchItem key={batch.id} batch={batch} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📦</Text>
              <Text className={styles.emptyText}>暂无符合条件的批次</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomActionBar}>
        <View className={styles.secondaryBtn} onClick={handleInbound}>
          <Text className={styles.secondaryBtnIcon}>📥</Text>
          <Text className={styles.secondaryBtnText}>入库</Text>
        </View>
        <View className={styles.primaryBtn} onClick={handleOutbound}>
          <Text className={styles.primaryBtnIcon}>📤</Text>
          <Text className={styles.primaryBtnText}>出库</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default ReagentDetailPage
