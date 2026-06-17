import React, { useState, useMemo } from 'react'
import { View, Text, Picker, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import dayjs from 'dayjs'
import { generateTimeSlots, generateDateRange } from '@/utils/dateUtils'
import { useBookingStore } from '@/store/useBookingStore'
import type { Booking } from '@/types/booking'
import styles from './index.module.scss'

interface TimeSlotPickerProps {
  cageId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  cageId,
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange
}) => {
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date')
  const bookings = useBookingStore(state => state.bookings)
  
  const timeSlots = useMemo(() => generateTimeSlots(''), [])
  const dateRange = useMemo(() => {
    try {
      if (startDate && endDate) {
        return generateDateRange(startDate, endDate)
      }
      return []
    } catch (error) {
      console.error('[TimeSlotPicker] 生成日期范围出错:', error)
      return []
    }
  }, [startDate, endDate])

  const minDate = dayjs().format('YYYY-MM-DD')
  const maxDate = dayjs().add(1, 'year').format('YYYY-MM-DD')

  const bookedSlots = useMemo(() => {
    try {
      const dayBookings = bookings.filter(
        b => b.cageId === cageId && 
        (b.status === 'confirmed' || b.status === 'pending') &&
        startDate >= b.startDate && startDate <= b.endDate
      )

      const slots: { startTime: string; endTime: string; booking: Booking }[] = []
      for (const booking of dayBookings) {
        slots.push({
          startTime: booking.startTime,
          endTime: booking.endTime,
          booking
        })
      }
      return slots
    } catch (error) {
      console.error('[TimeSlotPicker] 获取已预约时段出错:', error)
      return []
    }
  }, [cageId, startDate, bookings])

  const isTimeBooked = (time: string): boolean => {
    try {
      return bookedSlots.some(slot => {
        const slotStart = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1])
        const slotEnd = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1])
        const timeMin = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])
        return timeMin >= slotStart && timeMin < slotEnd
      })
    } catch (error) {
      console.error('[TimeSlotPicker] 检查时段是否已约出错:', error)
      return false
    }
  }

  const handleTimeSelect = (time: string, isBooked: boolean) => {
    if (isBooked) return
    try {
      onStartTimeChange(time)
    } catch (error) {
      console.error('[TimeSlotPicker] 选择时段出错:', error)
    }
  }

  return (
    <View className={styles.pickerContainer}>
      <View className={styles.tabs}>
        <View 
          className={classnames(styles.tab, activeTab === 'date' && styles.active)}
          onClick={() => setActiveTab('date')}
        >
          <Text className={styles.tabText}>选择日期</Text>
        </View>
        <View 
          className={classnames(styles.tab, activeTab === 'time' && styles.active)}
          onClick={() => setActiveTab('time')}
        >
          <Text className={styles.tabText}>选择时段</Text>
        </View>
      </View>

      {activeTab === 'date' && (
        <View className={styles.dateSection}>
          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <Text className={styles.dateLabel}>开始日期</Text>
              <Picker 
                mode="date" 
                value={startDate}
                start={minDate}
                end={maxDate}
                onChange={(e) => onStartDateChange(e.detail.value)}
              >
                <View className={styles.datePicker}>
                  <Text className={styles.dateValue}>{startDate || '请选择'}</Text>
                  <Text className={styles.pickerIcon}>›</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.dateItem}>
              <Text className={styles.dateLabel}>结束日期</Text>
              <Picker 
                mode="date" 
                value={endDate}
                start={startDate || minDate}
                end={maxDate}
                onChange={(e) => onEndDateChange(e.detail.value)}
              >
                <View className={styles.datePicker}>
                  <Text className={styles.dateValue}>{endDate || '请选择'}</Text>
                  <Text className={styles.pickerIcon}>›</Text>
                </View>
              </Picker>
            </View>
          </View>

          {dateRange.length > 0 && (
            <View className={styles.dateSummary}>
              <Text className={styles.summaryText}>
                共选择 <Text className={styles.highlight}>{dateRange.length}</Text> 天
              </Text>
              <ScrollView className={styles.datePreview} scrollX>
                {dateRange.slice(0, 7).map((date, index) => {
                  const d = dayjs(date)
                  return (
                    <View key={index} className={styles.dateChip}>
                      <Text className={styles.chipWeekday}>{d.format('ddd')}</Text>
                      <Text className={styles.chipDate}>{d.format('MM/DD')}</Text>
                    </View>
                  )
                })}
                {dateRange.length > 7 && (
                  <View className={styles.dateChip}>
                    <Text className={styles.chipMore}>+{dateRange.length - 7}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {activeTab === 'time' && (
        <View className={styles.timeSection}>
          <View className={styles.dateRow}>
            <View className={styles.dateItem}>
              <Text className={styles.dateLabel}>开始时间</Text>
              <Picker 
                mode="time" 
                value={startTime}
                onChange={(e) => onStartTimeChange(e.detail.value)}
              >
                <View className={styles.datePicker}>
                  <Text className={styles.dateValue}>{startTime || '请选择'}</Text>
                  <Text className={styles.pickerIcon}>›</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.dateItem}>
              <Text className={styles.dateLabel}>结束时间</Text>
              <Picker 
                mode="time" 
                value={endTime}
                onChange={(e) => onEndTimeChange(e.detail.value)}
              >
                <View className={styles.datePicker}>
                  <Text className={styles.dateValue}>{endTime || '请选择'}</Text>
                  <Text className={styles.pickerIcon}>›</Text>
                </View>
              </Picker>
            </View>
          </View>

          <Text className={styles.sectionTitle}>快捷选择时段</Text>
          <View className={styles.slotGrid}>
            {timeSlots.map((slot, index) => {
              const isBooked = isTimeBooked(slot.startTime)
              const isSelected = slot.startTime === startTime
              return (
                <View 
                  key={index}
                  className={classnames(
                    styles.slotItem,
                    isBooked && styles.booked,
                    isSelected && styles.selected
                  )}
                  onClick={() => handleTimeSelect(slot.startTime, isBooked)}
                >
                  <Text className={styles.slotTime}>{slot.startTime}</Text>
                  <Text className={styles.slotRange}>-{slot.endTime}</Text>
                  {isBooked && <Text className={styles.bookedTag}>已约</Text>}
                </View>
              )
            })}
          </View>

          {bookedSlots.length > 0 && (
            <View className={styles.bookedNotice}>
              <Text className={styles.noticeIcon}>⚠</Text>
              <Text className={styles.noticeText}>
                当日已有 {bookedSlots.length} 个预约时段
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default TimeSlotPicker
