import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { useBookingStore } from '@/store/useBookingStore'
import type { BookingStatus, Booking } from '@/types/booking'
import styles from './index.module.scss'

const statusTabs: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const MyBookingPage: React.FC = () => {
  const bookings = useBookingStore(state => state.bookings)
  const filterStatus = useBookingStore(state => state.filterStatus)
  const setFilterStatus = useBookingStore(state => state.setFilterStatus)
  const cancelBooking = useBookingStore(state => state.cancelBooking)
  const refreshBookings = useBookingStore(state => state.refreshBookings)
  const setSelectedBooking = useBookingStore(state => state.setSelectedBooking)
  const currentResearcher = useBookingStore(state => state.currentResearcher)

  const [refreshing, setRefreshing] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  usePullDownRefresh(() => {
    setRefreshing(true)
    refreshBookings()
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const filteredBookings = useMemo(() => {
    try {
      let result = [...bookings]
      if (filterStatus !== 'all') {
        result = result.filter(b => b.status === filterStatus)
      }
      if (currentResearcher) {
        result = result.filter(b => b.researcher === currentResearcher)
      }
      return result.sort((a, b) => 
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      )
    } catch (error) {
      console.error('[MyBooking] 过滤预约列表出错:', error)
      return []
    }
  }, [bookings, filterStatus, currentResearcher, refreshing])

  const statusText = (status: string): string => {
    const map: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成',
      rejected: '已拒绝'
    }
    return map[status] || status
  }

  const canCancel = (booking: Booking): boolean => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false
    const startDateTime = dayjs(`${booking.startDate} ${booking.startTime}`)
    return startDateTime.diff(dayjs(), 'hour') >= 24
  }

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setCancelReason('')
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return

    if (!cancelReason.trim()) {
      Taro.showToast({ title: '请填写取消原因', icon: 'none' })
      return
    }

    try {
      const success = cancelBooking(selectedBookingId, cancelReason)
      if (success) {
        Taro.showToast({ title: '取消成功', icon: 'success' })
        setShowCancelModal(false)
        setSelectedBookingId(null)
      } else {
        Taro.showToast({ title: '取消失败，请重试', icon: 'none' })
      }
    } catch (error) {
      console.error('[MyBooking] 取消失败:', error)
      Taro.showToast({ title: '系统错误，请重试', icon: 'none' })
    }
  }

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking)
    Taro.navigateTo({
      url: `/pages/booking-confirm/index?cageId=${booking.cageId}&cageNo=${booking.cageNo}&startDate=${booking.startDate}&endDate=${booking.endDate}&startTime=${booking.startTime}&endTime=${booking.endTime}`
    })
  }

  const stats = useMemo(() => {
    const all = filteredBookings.length
    const pending = filteredBookings.filter(b => b.status === 'pending').length
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length
    const today = filteredBookings.filter(b =>
      b.status !== 'cancelled' && dayjs(b.startDate).isSame(dayjs(), 'day')
    ).length
    return { all, pending, confirmed, today }
  }, [filteredBookings])

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.all}</Text>
          <Text className={styles.statLabel}>全部</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.warning)}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待确认</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.success)}>{stats.confirmed}</Text>
          <Text className={styles.statLabel}>已确认</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.primary)}>{stats.today}</Text>
          <Text className={styles.statLabel}>今日</Text>
        </View>
      </View>

      <ScrollView className={styles.tabBar} scrollX>
        {statusTabs.map(tab => (
          <View
            key={tab.value}
            className={classnames(
              styles.tabItem,
              filterStatus === tab.value && styles.active
            )}
            onClick={() => setFilterStatus(tab.value)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.bookingList}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <View key={booking.id} className={styles.bookingCard}>
              <View className={styles.cardHeader}>
                <View className={styles.cageRow}>
                  <Text className={styles.cageNo}>笼位 {booking.cageNo}</Text>
                  <StatusTag type={booking.status as any} text={statusText(booking.status)} size="sm" />
                </View>
                <Text className={styles.createTime}>
                  提交于 {dayjs(booking.createTime).format('MM-DD HH:mm')}
                </Text>
              </View>

              <View className={styles.cardBody}>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>项目名称</Text>
                  <Text className={styles.infoValue}>{booking.projectName}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>课题组</Text>
                  <Text className={styles.infoValue}>{booking.researchGroup}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>负责人</Text>
                  <Text className={styles.infoValue}>{booking.researcher}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>动物</Text>
                  <Text className={styles.infoValue}>
                    {booking.animalType} · {booking.animalCount}只
                  </Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>日期</Text>
                  <Text className={styles.infoValue}>
                    {booking.startDate} 至 {booking.endDate}
                  </Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>时段</Text>
                  <Text className={classnames(styles.infoValue, styles.highlight)}>
                    {booking.startTime} - {booking.endTime}
                  </Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>用途</Text>
                  <Text className={styles.infoValue}>{booking.purpose}</Text>
                </View>
                {booking.cancelReason && (
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>取消原因</Text>
                    <Text className={classnames(styles.infoValue, styles.danger)}>
                      {booking.cancelReason}
                    </Text>
                  </View>
                )}
              </View>

              <View className={styles.cardFooter}>
                {canCancel(booking) ? (
                  <View
                    className={classnames(styles.actionBtn, styles.danger)}
                    onClick={() => handleCancelClick(booking.id)}
                  >
                    <Text className={styles.actionBtnText}>取消预约</Text>
                  </View>
                ) : booking.status === 'pending' ? (
                  <View className={styles.waitingNotice}>
                    <Text className={styles.waitingText}>⏳ 等待管理员审核确认</Text>
                  </View>
                ) : booking.status === 'cancelled' ? (
                  <View className={styles.cancelledNotice}>
                    <Text className={styles.cancelledText}>
                      取消于 {dayjs(booking.cancelTime).format('MM-DD HH:mm')}
                    </Text>
                  </View>
                ) : null}

                <View
                  className={classnames(styles.actionBtn, styles.primary)}
                  onClick={() => handleViewDetail(booking)}
                >
                  <Text className={styles.actionBtnText}>查看详情</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无预约记录</Text>
            <View
              className={styles.emptyBtn}
              onClick={() => Taro.switchTab({ url: '/pages/cage/index' })}
            >
              <Text className={styles.emptyBtnText}>去预约笼位</Text>
            </View>
          </View>
        )}
      </View>

      {showCancelModal && (
        <View className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>取消预约</Text>
            <Text className={styles.modalDesc}>请填写取消原因（提前24小时可免费取消）</Text>

            <View className={styles.formGroup}>
              <Text className={styles.formLabel}>
                取消原因 <Text className={styles.required}>*</Text>
              </Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入取消原因"
                value={cancelReason}
                onInput={(e) => setCancelReason(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowCancelModal(false)}
              >
                <Text className={styles.modalBtnText}>再想想</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleConfirmCancel}
              >
                <Text className={styles.modalBtnText}>确认取消</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default MyBookingPage
