import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import ReagentCard from '@/components/ReagentCard'
import StatusTag from '@/components/StatusTag'
import { useReagentStore } from '@/store/useReagentStore'
import { useExpiryAlert } from '@/hooks/useExpiryAlert'
import type { ReagentCategory } from '@/types/reagent'
import styles from './index.module.scss'

const categoryOptions: { value: ReagentCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '试剂', label: '试剂' },
  { value: '耗材', label: '耗材' },
  { value: '培养基', label: '培养基' },
  { value: '抗体', label: '抗体' },
  { value: '其他', label: '其他' }
]

const expiryOptions: { value: 'all' | 'normal' | 'expiring' | 'expired'; label: string; type?: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '正常' },
  { value: 'expiring', label: '临期', type: 'expiring_7' },
  { value: 'expired', label: '过期', type: 'expired' }
]

const ReagentPage: React.FC = () => {
  const {
    filterCategory,
    filterExpiry,
    searchKeyword,
    setFilterCategory,
    setFilterExpiry,
    setSearchKeyword,
    getFilteredReagents,
    refreshReagents,
    checkExpiredBatches
  } = useReagentStore()

  const { expiringBatches, expiredBatches } = useExpiryAlert()
  const [refreshing, setRefreshing] = useState(false)

  useDidShow(() => {
    checkExpiredBatches()
  })

  usePullDownRefresh(() => {
    setRefreshing(true)
    refreshReagents()
    checkExpiredBatches()
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const filteredReagents = useMemo(() => getFilteredReagents(), [
    filterCategory, filterExpiry, searchKeyword, refreshing
  ])

  const totalExpiring = expiringBatches.reduce((sum, b) => sum + b.availableQuantity, 0)
  const totalExpired = expiredBatches.reduce((sum, b) => sum + b.availableQuantity, 0)

  const handleReagentClick = (reagentId: string) => {
    Taro.navigateTo({
      url: `/pages/reagent-detail/index?id=${reagentId}`
    })
  }

  const handleInbound = () => {
    Taro.navigateTo({
      url: '/pages/batch-inbound/index'
    })
  }

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.alertBanner}>
        {totalExpiring > 0 && (
          <View className={classnames(styles.alertItem, styles.warning)}>
            <Text className={styles.alertIcon}>⚠️</Text>
            <Text className={styles.alertText}>临期 {totalExpiring} 份</Text>
          </View>
        )}
        {totalExpired > 0 && (
          <View className={classnames(styles.alertItem, styles.danger)}>
            <Text className={styles.alertIcon}>🚨</Text>
            <Text className={styles.alertText}>过期 {totalExpired} 份（已锁定）</Text>
          </View>
        )}
      </View>

      <View className={styles.searchSection}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索试剂名称、规格、生产厂家..."
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            confirmType="search"
          />
        </View>

        <ScrollView className={styles.filterRow} scrollX>
          {categoryOptions.map(option => (
            <View
              key={option.value}
              className={classnames(
                styles.filterChip,
                filterCategory === option.value && styles.active
              )}
              onClick={() => setFilterCategory(option.value)}
            >
              <Text className={styles.filterText}>{option.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>
          试剂耗材 ({filteredReagents.length})
        </Text>
        <View className={styles.statusFilter}>
          {expiryOptions.map(option => (
            <View
              key={option.value}
              className={classnames(
                styles.statusBtn,
                filterExpiry === option.value && styles.active
              )}
              onClick={() => setFilterExpiry(option.value)}
            >
              {option.type ? (
                <StatusTag type={option.type as any} text={option.label} size="sm" />
              ) : (
                <Text className={styles.statusBtnText}>{option.label}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.reagentList}>
        {filteredReagents.length > 0 ? (
          filteredReagents.map(reagent => (
            <ReagentCard
              key={reagent.id}
              reagent={reagent}
              onClick={() => handleReagentClick(reagent.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🧪</Text>
            <Text className={styles.emptyText}>暂无符合条件的试剂耗材</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomActionBar}>
        <View className={styles.actionButton} onClick={handleInbound}>
          <Text className={styles.actionIcon}>📥</Text>
          <Text className={styles.actionText}>批次入库</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default ReagentPage
