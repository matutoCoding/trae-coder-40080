import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { useBookingStore } from '@/store/useBookingStore'
import { useReagentStore } from '@/store/useReagentStore'
import { useOutboundStore } from '@/store/useOutboundStore'
import { batchList } from '@/data/reagentData'
import styles from './index.module.scss'

const userInfo = {
  name: '研究员',
  role: '课题负责人',
  researchGroup: '肿瘤生物学课题组',
  phone: '138****8001',
  email: 'researcher@lab.edu.cn',
  avatar: '👨‍🔬'
}

const menuItems = [
  { id: 'booking', icon: '📋', title: '我的预约', desc: '查看预约记录', url: '/pages/my-booking/index' },
  { id: 'inbound', icon: '📥', title: '入库记录', desc: '查看批次入库', url: '/pages/batch-inbound/index' },
  { id: 'cage', icon: '🔬', title: '笼位预约', desc: '预约动物笼位', url: '/pages/cage/index', isTab: true },
  { id: 'reagent', icon: '🧪', title: '耗材管理', desc: '管理试剂耗材', url: '/pages/reagent/index', isTab: true },
  { id: 'outbound', icon: '📤', title: '出库登记', desc: '登记出库记录', url: '/pages/outbound/index', isTab: true }
]

const MinePage: React.FC = () => {
  const { bookingList } = useBookingStore()
  const { reagents } = useReagentStore()
  const { outboundRecords } = useOutboundStore()
  const [refreshing, setRefreshing] = useState(false)

  usePullDownRefresh(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const myBookings = useMemo(() => 
    bookingList.filter(b => b.researchGroup === userInfo.researchGroup),
    [refreshing]
  )

  const myOutbounds = useMemo(() =>
    outboundRecords.filter(o => o.researchGroup === userInfo.researchGroup),
    [refreshing]
  )

  const pendingBookings = myBookings.filter(b => b.status === 'pending').length
  const confirmedBookings = myBookings.filter(b => b.status === 'confirmed').length
  const todayBookings = myBookings.filter(b =>
    b.status !== 'cancelled' && dayjs(b.startDate).isSame(dayjs(), 'day')
  ).length

  const myInbounds = useMemo(() =>
    batchList.filter(b => b.operator === userInfo.name),
    [refreshing]
  )

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.isTab) {
      Taro.switchTab({ url: item.url })
    } else {
      Taro.navigateTo({ url: item.url })
    }
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
        <View className={styles.userCard}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>{userInfo.avatar}</Text>
          </View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{userInfo.name}</Text>
            <View className={styles.userRoleRow}>
              <Text className={styles.userRole}>{userInfo.role}</Text>
              <Text className={styles.userGroup}>{userInfo.researchGroup}</Text>
            </View>
            <Text className={styles.userContact}>{userInfo.phone} · {userInfo.email}</Text>
          </View>
        </View>

        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{myBookings.length}</Text>
            <Text className={styles.statLabel}>总预约</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.warning)}>{pendingBookings}</Text>
            <Text className={styles.statLabel}>待确认</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.success)}>{confirmedBookings}</Text>
            <Text className={styles.statLabel}>已确认</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.primary)}>{todayBookings}</Text>
            <Text className={styles.statLabel}>今日</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickStats}>
        <View className={styles.quickStatCard}>
          <Text className={styles.quickStatIcon}>📦</Text>
          <View className={styles.quickStatInfo}>
            <Text className={styles.quickStatValue}>{myOutbounds.length}</Text>
            <Text className={styles.quickStatLabel}>出库记录</Text>
          </View>
        </View>
        <View className={styles.quickStatCard}>
          <Text className={styles.quickStatIcon}>📥</Text>
          <View className={styles.quickStatInfo}>
            <Text className={styles.quickStatValue}>{myInbounds.length}</Text>
            <Text className={styles.quickStatLabel}>入库批次</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>功能菜单</Text>
      <View className={styles.menuList}>
        {menuItems.map(item => (
          <View
            key={item.id}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item)}
          >
            <View className={styles.menuIcon}>
              <Text className={styles.menuIconText}>{item.icon}</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>{item.title}</Text>
              <Text className={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      <Text className={styles.sectionTitle}>最近预约</Text>
      <View className={styles.recentList}>
        {myBookings.slice(0, 3).length > 0 ? (
          myBookings.slice(0, 3).map(booking => (
            <View key={booking.id} className={styles.recentCard}>
              <View className={styles.recentHeader}>
                <View className={styles.recentTitleRow}>
                  <Text className={styles.recentCage}>笼位 {booking.cageNo}</Text>
                  <StatusTag type={booking.status as any} text={statusText(booking.status)} size="sm" />
                </View>
                <Text className={styles.recentDate}>
                  {dayjs(booking.startDate).format('MM-DD')}
                </Text>
              </View>
              <View className={styles.recentInfo}>
                <Text className={styles.recentTime}>
                  {booking.startTime} - {booking.endTime}
                </Text>
                <Text className={styles.recentProject}>{booking.projectName}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📅</Text>
            <Text className={styles.emptyText}>暂无预约记录</Text>
          </View>
        )}
      </View>

      <Text className={styles.sectionTitle}>最近出库</Text>
      <View className={styles.recentList}>
        {myOutbounds.slice(0, 3).length > 0 ? (
          myOutbounds.slice(0, 3).map(outbound => (
            <View key={outbound.id} className={styles.recentCard}>
              <View className={styles.recentHeader}>
                <View className={styles.recentTitleRow}>
                  <Text className={styles.recentCage}>{outbound.outboundNo}</Text>
                  <StatusTag type={outbound.status as any} text="已完成" size="sm" />
                </View>
                <Text className={styles.recentDate}>
                  {dayjs(outbound.outboundTime).format('MM-DD')}
                </Text>
              </View>
              <View className={styles.recentInfo}>
                <Text className={styles.recentTime}>
                  {outbound.purpose}
                </Text>
                <Text className={styles.recentProject}>
                  共 {outbound.totalItems} 项 · {outbound.totalQuantity} 份
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

      <View className={styles.footer}>
        <Text className={styles.footerText}>实验动物房管理系统 v1.0.0</Text>
        <Text className={styles.footerCopyright}>© 2025 科研机构管理平台</Text>
      </View>
    </ScrollView>
  )
}

export default MinePage
