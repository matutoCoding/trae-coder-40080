import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import CalendarView from '@/components/CalendarView'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { useCageStore } from '@/store/useCageStore'
import { useConflictCheck } from '@/hooks/useConflictCheck'
import { useBookingStore } from '@/store/useBookingStore'
import styles from './index.module.scss'

const CageDetailPage: React.FC = () => {
  const router = useRouter()
  const cageId = router.params.id as string
  const { getCageById } = useCageStore()
  const bookings = useBookingStore(state => state.bookings)
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('12:00')

  useDidShow(() => {
    // 页面显示时重置选择为今天，确保状态最新
    setSelectedDate(dayjs().format('YYYY-MM-DD'))
    setStartDate(dayjs().format('YYYY-MM-DD'))
    setEndDate(dayjs().format('YYYY-MM-DD'))
  })

  const cage = useMemo(() => {
    try {
      return getCageById(cageId)
    } catch (error) {
      console.error('[CageDetail] 获取笼位信息出错:', error)
      return null
    }
  }, [cageId])

  const { hasConflict, conflictMessage, conflictingBookings } = useConflictCheck(
    cageId,
    startDate,
    endDate,
    startTime,
    endTime
  )

  const cageBookings = useMemo(() => {
    try {
      return bookings.filter(b => b.cageId === cageId && b.status !== 'cancelled')
    } catch (error) {
      console.error('[CageDetail] 获取笼位预约列表出错:', error)
      return []
    }
  }, [bookings, cageId])

  const statusText = (status: string): string => {
    const map: Record<string, string> = {
      available: '可预约',
      booked: '已预约',
      maintenance: '维护中',
      cleaning: '清洁中',
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成'
    }
    return map[status] || status
  }

  const typeText = (type: string): string => {
    const map: Record<string, string> = {
      '小鼠笼': '🐭 小鼠笼',
      '大鼠笼': '🐀 大鼠笼',
      '兔笼': '🐰 兔笼',
      '豚鼠笼': '🐹 豚鼠笼',
      '其他': '📦 其他'
    }
    return map[type] || type
  }

  const handleBookNow = () => {
    try {
      if (!cage) {
        Taro.showToast({ title: '笼位信息不存在', icon: 'none' })
        return
      }

      if (cage.status === 'maintenance' || cage.status === 'cleaning') {
        Taro.showToast({ title: '该笼位当前不可预约', icon: 'none' })
        return
      }

      if (hasConflict) {
        Taro.showToast({ title: '所选时段存在冲突', icon: 'none' })
        return
      }

      if (!startDate || !endDate || !startTime || !endTime) {
        Taro.showToast({ title: '请选择完整的预约时段', icon: 'none' })
        return
      }

      if (dayjs(startDate).isAfter(dayjs(endDate))) {
        Taro.showToast({ title: '结束日期不能早于开始日期', icon: 'none' })
        return
      }

      const startMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
      const endMin = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
      if (startMin >= endMin) {
        Taro.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' })
        return
      }

      const params = new URLSearchParams({
        cageId,
        cageNo: cage.cageNo,
        startDate,
        endDate,
        startTime,
        endTime
      })

      Taro.navigateTo({
        url: `/pages/booking-confirm/index?${params.toString()}`
      })
    } catch (error) {
      console.error('[CageDetail] 预约操作出错:', error)
      Taro.showToast({ title: '操作失败，请重试', icon: 'none' })
    }
  }

  const handleDateSelect = (date: string) => {
    try {
      setSelectedDate(date)
      setStartDate(date)
      setEndDate(date)
    } catch (error) {
      console.error('[CageDetail] 选择日期出错:', error)
    }
  }

  if (!cage) {
    return (
      <View className={styles.emptyState}>
        <Text className={styles.emptyIcon}>🔬</Text>
        <Text className={styles.emptyText}>笼位信息不存在</Text>
      </View>
    )
  }

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.cageHeader}>
        <View className={styles.cageNoRow}>
          <Text className={styles.cageNo}>笼位 {cage.cageNo}</Text>
          <StatusTag type={cage.status as any} text={statusText(cage.status)} size="md" />
        </View>
        <Text className={styles.cageType}>{typeText(cage.type)}</Text>
        <Text className={styles.cageLocation}>📍 {cage.location} · {cage.room}</Text>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>笼位信息</Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>规格</Text>
            <Text className={styles.infoValue}>{cage.specification}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>容量</Text>
            <Text className={styles.infoValue}>{cage.capacity} 只</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>当前动物</Text>
            <Text className={classnames(
              styles.infoValue,
              cage.currentAnimals > 0 ? styles.warning : styles.success
            )}>
              {cage.currentAnimals} 只
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>楼层</Text>
            <Text className={styles.infoValue}>{cage.floor}</Text>
          </View>
        </View>

        {cage.equipment && cage.equipment.length > 0 && (
          <View className={styles.equipmentSection}>
            <Text className={styles.equipmentLabel}>配套设备</Text>
            <View className={styles.equipmentTags}>
              {cage.equipment.map((eq, index) => (
                <View key={index} className={styles.equipmentTag}>
                  <Text className={styles.equipmentText}>{eq}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {cage.remarks && (
          <View className={styles.remarksSection}>
            <Text className={styles.remarksLabel}>备注</Text>
            <Text className={styles.remarksText}>{cage.remarks}</Text>
          </View>
        )}
      </View>

      {hasConflict && (
        <View className={styles.conflictAlert}>
          <Text className={styles.conflictIcon}>⚠️</Text>
          <View className={styles.conflictContent}>
            <Text className={styles.conflictTitle}>时段冲突</Text>
            <Text className={styles.conflictText}>{conflictMessage}</Text>
            {conflictingBookings.map((booking, index) => (
              <View key={index} className={styles.conflictBooking}>
                <Text className={styles.conflictBookingText}>
                  {booking.researchGroup} · {booking.projectName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.sectionCard}>
        <Text className={styles.cardTitle}>选择预约日期</Text>
        <CalendarView
          cageId={cageId}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.cardTitle}>选择预约时段</Text>
        <TimeSlotPicker
          cageId={cageId}
          startDate={startDate}
          endDate={endDate}
          startTime={startTime}
          endTime={endTime}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />
      </View>

      {cageBookings.length > 0 && (
        <View className={styles.sectionCard}>
          <Text className={styles.cardTitle}>已有预约 ({cageBookings.length})</Text>
          {cageBookings.slice(0, 3).map(booking => (
            <View key={booking.id} className={styles.existingBooking}>
              <View className={styles.bookingHeader}>
                <Text className={styles.bookingDate}>
                  {booking.startDate} 至 {booking.endDate}
                </Text>
                <StatusTag type={booking.status as any} text={statusText(booking.status)} size="sm" />
              </View>
              <View className={styles.bookingInfo}>
                <Text className={styles.bookingTime}>{booking.startTime} - {booking.endTime}</Text>
                <Text className={styles.bookingGroup}>{booking.researchGroup}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className={styles.bottomActionBar}>
        <View className={styles.selectedInfo}>
          <Text className={styles.selectedLabel}>已选时段</Text>
          <Text className={styles.selectedValue}>
            {startDate} 至 {endDate}
          </Text>
          <Text className={styles.selectedTime}>
            {startTime} - {endTime}
          </Text>
        </View>
        <View
          className={classnames(
            styles.bookButton,
            (hasConflict || cage.status === 'maintenance' || cage.status === 'cleaning') && styles.disabled
          )}
          onClick={handleBookNow}
        >
          <Text className={styles.bookText}>
            {hasConflict ? '时段冲突' : cage.status === 'maintenance' || cage.status === 'cleaning' ? '不可预约' : '立即预约'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default CageDetailPage
