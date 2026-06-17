import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import CageCard from '@/components/CageCard'
import { useCageStore } from '@/store/useCageStore'
import type { CageType, CageStatus } from '@/types/cage'
import styles from './index.module.scss'

const typeOptions: { value: CageType | 'all'; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: '小鼠笼', label: '小鼠笼' },
  { value: '大鼠笼', label: '大鼠笼' },
  { value: '兔笼', label: '兔笼' },
  { value: '豚鼠笼', label: '豚鼠笼' },
  { value: '其他', label: '其他' }
]

const statusOptions: { value: CageStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '可约' },
  { value: 'booked', label: '已约' },
  { value: 'maintenance', label: '维护' },
  { value: 'cleaning', label: '清洁' }
]

const CagePage: React.FC = () => {
  const { 
    filterType, 
    filterStatus, 
    searchKeyword,
    setFilterType, 
    setFilterStatus, 
    setSearchKeyword,
    getFilteredCages,
    refreshCages
  } = useCageStore()

  const [refreshing, setRefreshing] = useState(false)

  usePullDownRefresh(() => {
    setRefreshing(true)
    refreshCages()
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const filteredCages = useMemo(() => getFilteredCages(), [
    filterType, filterStatus, searchKeyword, refreshing
  ])

  const handleCageClick = (cageId: string) => {
    Taro.navigateTo({
      url: `/pages/cage-detail/index?id=${cageId}`
    })
  }

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.searchSection}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索笼位号、位置、规格..."
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            confirmType="search"
          />
        </View>

        <ScrollView className={styles.filterRow} scrollX>
          {typeOptions.map(option => (
            <View
              key={option.value}
              className={classnames(
                styles.filterChip,
                filterType === option.value && styles.active
              )}
              onClick={() => setFilterType(option.value)}
            >
              <Text className={styles.filterText}>{option.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>
          笼位列表 ({filteredCages.length})
        </Text>
        <View className={styles.statusFilter}>
          {statusOptions.map(option => (
            <View
              key={option.value}
              className={classnames(
                styles.statusBtn,
                filterStatus === option.value && styles.active
              )}
              onClick={() => setFilterStatus(option.value)}
            >
              <Text className={styles.statusBtnText}>{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.cageList}>
        {filteredCages.length > 0 ? (
          filteredCages.map(cage => (
            <CageCard
              key={cage.id}
              cage={cage}
              onClick={() => handleCageClick(cage.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🔬</Text>
            <Text className={styles.emptyText}>暂无符合条件的笼位</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default CagePage
