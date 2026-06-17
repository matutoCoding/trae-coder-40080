import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import StatCard from '@/components/StatCard'
import { useOutboundStore } from '@/store/useOutboundStore'
import { useReagentStore } from '@/store/useReagentStore'
import { useFIFO } from '@/hooks/useFIFO'
import styles from './index.module.scss'

const OutboundPage: React.FC = () => {
  const { getOutboundRecords, refreshOutboundRecords } = useOutboundStore()
  const { reagents, checkExpiredBatches } = useReagentStore()
  const { lowStockReagents, fifoComplianceRate } = useFIFO()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'records' | 'fifo'>('records')

  usePullDownRefresh(() => {
    setRefreshing(true)
    refreshOutboundRecords()
    checkExpiredBatches()
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const outboundRecords = useMemo(() => getOutboundRecords(), [refreshing])

  const todayOutbound = outboundRecords.filter(o =>
    dayjs(o.outboundTime).isSame(dayjs(), 'day')
  )
  const weekOutbound = outboundRecords.filter(o =>
    dayjs(o.outboundTime).isSame(dayjs(), 'week')
  )
  const totalQuantity = outboundRecords.reduce((sum, o) => sum + o.totalQuantity, 0)

  const handleNewOutbound = () => {
    Taro.navigateTo({
      url: '/pages/outbound-confirm/index'
    })
  }

  const handleViewDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/outbound-confirm/index?id=${id}`
    })
  }

  const statusText = (status: string): string => {
    const map: Record<string, string> = {
      pending: '待出库',
      completed: '已完成',
      cancelled: '已取消'
    }
    return map[status] || status
  }

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.statGrid}>
        <StatCard
          title="今日出库"
          value={todayOutbound.length}
          unit="单"
          color="primary"
        />
        <StatCard
          title="本周出库"
          value={weekOutbound.length}
          unit="单"
          color="success"
        />
        <StatCard
          title="累计出库量"
          value={totalQuantity}
          unit="份"
          color="info"
        />
        <StatCard
          title="FIFO合规率"
          value={fifoComplianceRate}
          unit="%"
          color="warning"
        />
      </View>

      {lowStockReagents.length > 0 && (
        <View className={styles.alertSection}>
          <Text className={styles.alertTitle}>⚠️ 库存预警</Text>
          <View className={styles.alertList}>
            {lowStockReagents.slice(0, 3).map((reagent, index) => (
              <View key={index} className={styles.alertItem}>
                <Text className={styles.alertItemName}>{reagent.name}</Text>
                <Text className={styles.alertItemStock}>
                  仅剩 {reagent.availableStock}{reagent.unit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.tabBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'records' && styles.active)}
          onClick={() => setActiveTab('records')}
        >
          <Text className={styles.tabText}>出库记录</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'fifo' && styles.active)}
          onClick={() => setActiveTab('fifo')}
        >
          <Text className={styles.tabText}>FIFO原则</Text>
        </View>
      </View>

      {activeTab === 'records' ? (
        <View className={styles.recordsSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              出库记录 ({outboundRecords.length})
            </Text>
          </View>

          {outboundRecords.length > 0 ? (
            outboundRecords.map(record => (
              <View
                key={record.id}
                className={styles.recordCard}
                onClick={() => handleViewDetail(record.id)}
              >
                <View className={styles.recordHeader}>
                  <View className={styles.recordNoRow}>
                    <Text className={styles.recordNo}>{record.outboundNo}</Text>
                    <StatusTag type={record.status as any} text={statusText(record.status)} size="sm" />
                  </View>
                  <Text className={styles.recordTime}>
                    {dayjs(record.outboundTime).format('MM-DD HH:mm')}
                  </Text>
                </View>

                <View className={styles.recordInfo}>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>领用课题组</Text>
                    <Text className={styles.infoValue}>{record.researchGroup}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>领用人</Text>
                    <Text className={styles.infoValue}>{record.receiver}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>用途</Text>
                    <Text className={styles.infoValue}>{record.purpose}</Text>
                  </View>
                </View>

                <View className={styles.recordItems}>
                  {record.items.slice(0, 2).map((item, index) => (
                    <View key={index} className={styles.itemRow}>
                      <Text className={styles.itemName}>{item.reagentName}</Text>
                      <View className={styles.itemBatch}>
                        <Text className={styles.itemBatchNo}>批次 {item.batchNo}</Text>
                        <Text className={styles.itemQty}>
                          {item.quantity}{item.unit}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {record.items.length > 2 && (
                    <Text className={styles.moreItems}>
                      还有 {record.items.length - 2} 项...
                    </Text>
                  )}
                </View>

                <View className={styles.recordFooter}>
                  <Text className={styles.footerInfo}>
                    共 {record.totalItems} 项 · {record.totalQuantity} 份
                  </Text>
                  <Text className={styles.operator}>
                    操作人：{record.operator}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📦</Text>
              <Text className={styles.emptyText}>暂无出库记录</Text>
            </View>
          )}
        </View>
      ) : (
        <View className={styles.fifoSection}>
          <View className={styles.fifoCard}>
            <View className={styles.fifoHeader}>
              <Text className={styles.fifoIcon}>📋</Text>
              <Text className={styles.fifoTitle}>先进先出 (FIFO) 出库原则</Text>
            </View>

            <View className={styles.fifoContent}>
              <Text className={styles.fifoDesc}>
                系统严格按照效期先后自动分配出库批次，确保先到期的试剂耗材优先使用，避免浪费。
              </Text>

              <View className={styles.fifoRuleList}>
                <View className={styles.ruleItem}>
                  <View className={styles.ruleNumber}>1</View>
                  <View className={styles.ruleContent}>
                    <Text className={styles.ruleTitle}>效期优先</Text>
                    <Text className={styles.ruleDesc}>距离效期最近的批次优先出库</Text>
                  </View>
                </View>
                <View className={styles.ruleItem}>
                  <View className={styles.ruleNumber}>2</View>
                  <View className={styles.ruleContent}>
                    <Text className={styles.ruleTitle}>自动分配</Text>
                    <Text className={styles.ruleDesc}>系统自动计算并推荐最优批次组合</Text>
                  </View>
                </View>
                <View className={styles.ruleItem}>
                  <View className={styles.ruleNumber}>3</View>
                  <View className={styles.ruleContent}>
                    <Text className={styles.ruleTitle}>过期锁定</Text>
                    <Text className={styles.ruleDesc}>已过期批次自动锁定，禁止出库</Text>
                  </View>
                </View>
                <View className={styles.ruleItem}>
                  <View className={styles.ruleNumber}>4</View>
                  <View className={styles.ruleContent}>
                    <Text className={styles.ruleTitle}>临期预警</Text>
                    <Text className={styles.ruleDesc}>提前30/15/7天多级预警提醒</Text>
                  </View>
                </View>
              </View>

              <View className={styles.fifoExample}>
                <Text className={styles.exampleTitle}>出库示例</Text>
                <View className={styles.exampleContent}>
                  <Text className={styles.exampleText}>
                    某试剂有3个批次：
                  </Text>
                  <Text className={styles.exampleText}>
                    · 批次A：效期2025-07-01，库存5瓶
                  </Text>
                  <Text className={styles.exampleText}>
                    · 批次B：效期2025-08-15，库存10瓶
                  </Text>
                  <Text className={styles.exampleText}>
                    · 批次C：效期2025-12-31，库存20瓶
                  </Text>
                  <Text className={styles.exampleText}>
                    {'\n'}如需出库7瓶，系统将自动分配：
                  </Text>
                  <Text className={styles.exampleText}>
                    → 批次A出5瓶 + 批次B出2瓶
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.reagentListSection}>
            <Text className={styles.sectionTitle}>试剂库存（按FIFO排序）</Text>
            {reagents.slice(0, 5).map(reagent => (
              <View key={reagent.id} className={styles.reagentRow}>
                <View className={styles.reagentInfo}>
                  <Text className={styles.reagentName}>{reagent.name}</Text>
                  <Text className={styles.reagentSpec}>{reagent.specification}</Text>
                </View>
                <View className={styles.reagentStock}>
                  <Text className={styles.stockValue}>{reagent.availableStock}</Text>
                  <Text className={styles.stockUnit}>{reagent.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.bottomActionBar}>
        <View className={styles.actionButton} onClick={handleNewOutbound}>
          <Text className={styles.actionIcon}>📤</Text>
          <Text className={styles.actionText}>新建出库</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default OutboundPage
