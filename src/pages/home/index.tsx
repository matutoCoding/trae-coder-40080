import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import dayjs from 'dayjs'
import StatCard from '@/components/StatCard'
import StatusTag from '@/components/StatusTag'
import { useExpiryAlert } from '@/hooks/useExpiryAlert'
import { cageList } from '@/data/cageData'
import { bookingList } from '@/data/bookingData'
import { reagentList } from '@/data/reagentData'
import { outboundRecords } from '@/data/outboundData'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const { alerts, expiringBatches, expiredBatches } = useExpiryAlert()

  useDidShow(() => {
    setCurrentDate(dayjs())
  })

  usePullDownRefresh(() => {
    setCurrentDate(dayjs())
    setTimeout(() => {
      Taro.stopPullDownRefresh()
      Taro.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
  })

  const availableCages = cageList.filter(c => c.status === 'available').length
  const pendingBookings = bookingList.filter(b => b.status === 'pending').length
  const expiringCount = expiringBatches.reduce((sum, b) => sum + b.availableQuantity, 0)
  const todayOutbound = outboundRecords.filter(o => 
    dayjs(o.outboundTime).isSame(dayjs(), 'day')
  ).length

  const todayBookings = bookingList.filter(b => 
    b.status !== 'cancelled' &&
    dayjs(b.startDate).isSame(dayjs(), 'day')
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const navigateTo = (url: string) => {
    Taro.navigateTo({ url })
  }

  const switchTab = (url: string) => {
    Taro.switchTab({ url })
  }

  const statusText = (status: string): string => {
    const map: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成'
    }
    return map[status] || status
  }

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <View className={styles.greeting}>
            <Text className={styles.greetingTitle}>欢迎使用</Text>
            <Text className={styles.greetingSubtitle}>实验动物房管理系统</Text>
          </View>
          <View className={styles.dateInfo}>
            <Text className={styles.dateText}>{currentDate.format('YYYY年MM月DD日')}</Text>
            <Text className={styles.weekdayText}>{currentDate.format('dddd')}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statGrid}>
        <StatCard 
          title="可预约笼位" 
          value={availableCages} 
          unit="个"
          color="success"
          onClick={() => switchTab('/pages/cage/index')}
        />
        <StatCard 
          title="待确认预约" 
          value={pendingBookings} 
          unit="单"
          color="primary"
          onClick={() => navigateTo('/pages/my-booking/index')}
        />
        <StatCard 
          title="临期耗材" 
          value={expiringCount} 
          unit="份"
          color="warning"
          onClick={() => switchTab('/pages/reagent/index')}
        />
        <StatCard 
          title="今日出库" 
          value={todayOutbound} 
          unit="单"
          color="info"
          onClick={() => switchTab('/pages/outbound/index')}
        />
      </View>

      <Text className={styles.sectionTitle}>
        快捷操作
      </Text>

      <View className={styles.quickActions}>
        <View className={styles.actionItem} onClick={() => switchTab('/pages/cage/index')}>
          <View className={`${styles.actionIcon} ${styles.cage}`}>
            <Text className={styles.actionIconText}>🔬</Text>
          </View>
          <Text className={styles.actionText}>笼位预约</Text>
        </View>
        <View className={styles.actionItem} onClick={() => switchTab('/pages/reagent/index')}>
          <View className={`${styles.actionIcon} ${styles.reagent}`}>
            <Text className={styles.actionIconText}>🧪</Text>
          </View>
          <Text className={styles.actionText}>耗材管理</Text>
        </View>
        <View className={styles.actionItem} onClick={() => switchTab('/pages/outbound/index')}>
          <View className={`${styles.actionIcon} ${styles.outbound}`}>
            <Text className={styles.actionIconText}>📦</Text>
          </View>
          <Text className={styles.actionText}>出库登记</Text>
        </View>
        <View className={styles.actionItem} onClick={() => navigateTo('/pages/my-booking/index')}>
          <View className={`${styles.actionIcon} ${styles.booking}`}>
            <Text className={styles.actionIconText}>📋</Text>
          </View>
          <Text className={styles.actionText}>我的预约</Text>
        </View>
      </View>

      {alerts.length > 0 && (
        <View className={styles.alertSection}>
          <Text className={styles.sectionTitle}>
            效期预警
            <Text className={styles.sectionMore} onClick={() => switchTab('/pages/reagent/index')}>
              查看全部 ›
            </Text>
          </Text>
          
          {alerts.slice(0, 2).map((alert, index) => (
            <View 
              key={index} 
              className={`${styles.alertCard} ${alert.level === 'critical' ? styles.critical : ''}`}
            >
              <View className={styles.alertHeader}>
                <View className={styles.alertTitle}>
                  <Text className={styles.alertIcon}>
                    {alert.level === 'critical' ? '🚨' : '⚠️'}
                  </Text>
                  <Text className={styles.alertTitleText}>{alert.title}</Text>
                </View>
                <Text className={styles.alertBadge}>
                  {alert.count}批次 / {alert.quantity}份
                </Text>
              </View>
              <Text className={styles.alertDesc}>
                以下试剂耗材即将到期，请优先使用或及时处理
              </Text>
              <View className={styles.alertItems}>
                {alert.batches.slice(0, 2).map((batch, bIndex) => (
                  <View key={bIndex} className={styles.alertItemRow}>
                    <Text className={styles.alertItemName}>{batch.reagentName}</Text>
                    <Text className={styles.alertItemInfo}>
                      批次{batch.batchNo} · 剩余{batch.availableQuantity}{batch.unit}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      <View className={styles.todaySection}>
        <Text className={styles.sectionTitle}>
          今日预约
          <Text className={styles.sectionMore} onClick={() => navigateTo('/pages/my-booking/index')}>
            全部预约 ›
          </Text>
        </Text>
        
        <View className={styles.todayCard}>
          <View className={styles.todayHeader}>
            <Text className={styles.todayTitle}>今日笼位使用情况</Text>
            <Text className={styles.todayCount}>共{todayBookings.length}个预约</Text>
          </View>
          
          {todayBookings.length > 0 ? (
            todayBookings.map((booking, index) => (
              <View key={index} className={styles.bookingItem}>
                <View className={styles.bookingTime}>
                  <Text className={styles.bookingStartTime}>{booking.startTime}</Text>
                  <Text className={styles.bookingEndTime}>至 {booking.endTime}</Text>
                </View>
                <View className={styles.bookingInfo}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
                    <Text className={styles.bookingCage}>笼位 {booking.cageNo}</Text>
                    <StatusTag 
                      type={booking.status as any} 
                      text={statusText(booking.status)} 
                      size="sm" 
                    />
                  </View>
                  <Text className={styles.bookingProject}>{booking.projectName}</Text>
                  <Text className={styles.bookingResearcher}>
                    {booking.researchGroup} · {booking.researcher}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📅</Text>
              <Text className={styles.emptyText}>今日暂无预约</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default HomePage
