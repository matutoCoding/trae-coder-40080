import React, { useMemo, useState } from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import dayjs from 'dayjs'
import { useBookingStore } from '@/store/useBookingStore'
import styles from './index.module.scss'

interface CalendarViewProps {
  cageId: string
  selectedDate: string
  onDateSelect: (date: string) => void
}

const CalendarView: React.FC<CalendarViewProps> = ({ cageId, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const bookings = useBookingStore(state => state.bookings)
  
  const calendarDays = useMemo(() => {
    try {
      const startOfMonth = dayjs(currentMonth).startOf('month')
      const endOfMonth = dayjs(currentMonth).endOf('month')
      const startDay = startOfMonth.day()
      const daysInMonth = endOfMonth.date()
      
      const days: { date: string; isCurrentMonth: boolean; day: number }[] = []
      
      const prevMonth = startOfMonth.subtract(1, 'month')
      const prevMonthDays = prevMonth.daysInMonth()
      for (let i = startDay - 1; i >= 0; i--) {
        const d = prevMonthDays - i
        days.push({
          date: prevMonth.date(d).format('YYYY-MM-DD'),
          isCurrentMonth: false,
          day: d
        })
      }
      
      for (let d = 1; d <= daysInMonth; d++) {
        days.push({
          date: startOfMonth.date(d).format('YYYY-MM-DD'),
          isCurrentMonth: true,
          day: d
        })
      }
      
      const remaining = 42 - days.length
      const nextMonth = endOfMonth.add(1, 'month')
      for (let d = 1; d <= remaining; d++) {
        days.push({
          date: nextMonth.date(d).format('YYYY-MM-DD'),
          isCurrentMonth: false,
          day: d
        })
      }
      
      return days
    } catch (error) {
      console.error('[CalendarView] 生成日历数据出错:', error)
      return []
    }
  }, [currentMonth])

  const getBookedSlotsForDate = (date: string): boolean => {
    try {
      const dayBookings = bookings.filter(
        b => b.cageId === cageId && 
        (b.status === 'confirmed' || b.status === 'pending') &&
        date >= b.startDate && date <= b.endDate
      )
      return dayBookings.length > 0
    } catch (error) {
      console.error('[CalendarView] 获取日期预约状态出错:', error)
      return false
    }
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const today = dayjs().format('YYYY-MM-DD')

  const prevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM'))
  }

  const nextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').format('YYYY-MM'))
  }

  const handleDateSelect = (date: string, isPast: boolean) => {
    if (isPast) return
    try {
      onDateSelect(date)
    } catch (error) {
      console.error('[CalendarView] 选择日期出错:', error)
    }
  }

  return (
    <View className={styles.calendarContainer}>
      <View className={styles.header}>
        <View className={styles.navBtn} onClick={prevMonth}>
          <Text className={styles.navIcon}>‹</Text>
        </View>
        <Text className={styles.monthTitle}>{dayjs(currentMonth).format('YYYY年MM月')}</Text>
        <View className={styles.navBtn} onClick={nextMonth}>
          <Text className={styles.navIcon}>›</Text>
        </View>
      </View>

      <View className={styles.weekdayRow}>
        {weekdays.map((w, i) => (
          <View key={i} className={styles.weekdayCell}>
            <Text className={classnames(
              styles.weekdayText,
              (i === 0 || i === 6) && styles.weekend
            )}>{w}</Text>
          </View>
        ))}
      </View>

      <View className={styles.daysGrid}>
        {calendarDays.map((item, index) => {
          const hasBooking = getBookedSlotsForDate(item.date)
          const isToday = item.date === today
          const isSelected = item.date === selectedDate
          const isPast = dayjs(item.date).isBefore(dayjs(), 'day')

          return (
            <View 
              key={index}
              className={classnames(
                styles.dayCell,
                !item.isCurrentMonth && styles.otherMonth,
                isToday && styles.today,
                isSelected && styles.selected,
                isPast && styles.past,
                hasBooking && styles.hasBooking
              )}
              onClick={() => handleDateSelect(item.date, isPast)}
            >
              <Text className={styles.dayText}>{item.day}</Text>
              {hasBooking && item.isCurrentMonth && (
                <View className={styles.bookingDot} />
              )}
            </View>
          )
        })}
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.available)} />
          <Text className={styles.legendText}>可约</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.booked)} />
          <Text className={styles.legendText}>已约</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.todayDot)} />
          <Text className={styles.legendText}>今天</Text>
        </View>
      </View>
    </View>
  )
}

export default CalendarView
