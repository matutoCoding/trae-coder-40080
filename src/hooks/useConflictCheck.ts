import { useMemo } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { isDateOverlap, generateDateRange } from '@/utils/dateUtils'
import type { ConflictResult, Booking } from '@/types/booking'

export const useConflictCheck = (
  cageId: string,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): ConflictResult => {
  const bookings = useBookingStore(state => state.bookings)

  const result = useMemo(() => {
    if (!cageId || !startDate || !endDate || !startTime || !endTime) {
      return {
        hasConflict: false,
        conflictingBookings: [],
        conflictMessage: ''
      }
    }

    try {
      const activeBookings = bookings.filter(
        booking => booking.cageId === cageId && 
        (booking.status === 'confirmed' || booking.status === 'pending')
      )
      
      const filteredBookings = excludeBookingId
        ? activeBookings.filter(b => b.id !== excludeBookingId)
        : activeBookings

      const conflictingBookings: Booking[] = []

      for (const booking of filteredBookings) {
        if (isDateOverlap(startDate, endDate, booking.startDate, booking.endDate)) {
          const newDateRange = generateDateRange(startDate, endDate)
          const existingDateRange = generateDateRange(booking.startDate, booking.endDate)
          const overlappingDates = newDateRange.filter(d => existingDateRange.includes(d))

          if (overlappingDates.length > 0) {
            const newStart = Math.min(
              parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]),
              parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
            )
            const newEnd = Math.max(
              parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]),
              parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
            )
            const existStart = Math.min(
              parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]),
              parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1])
            )
            const existEnd = Math.max(
              parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]),
              parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1])
            )

            if (newStart < existEnd && existStart < newEnd) {
              conflictingBookings.push(booking)
            }
          }
        }
      }

      let conflictMessage = ''
      if (conflictingBookings.length > 0) {
        const conflictInfo = conflictingBookings
          .map(b => `笼位${b.cageNo}在${b.startDate}至${b.endDate} ${b.startTime}-${b.endTime}已被"${b.researchGroup}"预约`)
          .join('；')
        conflictMessage = `时段冲突：${conflictInfo}`
        console.warn('[ConflictCheck] 检测到预约冲突:', conflictMessage)
      }

      return {
        hasConflict: conflictingBookings.length > 0,
        conflictingBookings,
        conflictMessage
      }
    } catch (error) {
      console.error('[useConflictCheck] 冲突检测出错:', error)
      return {
        hasConflict: false,
        conflictingBookings: [],
        conflictMessage: ''
      }
    }
  }, [cageId, startDate, endDate, startTime, endTime, excludeBookingId, bookings])

  return result
}

export const useCageAvailability = (cageId: string, date: string) => {
  const bookings = useBookingStore(state => state.bookings)

  const result = useMemo(() => {
    if (!cageId || !date) {
      return {
        hasBookings: false,
        bookedSlots: [],
        isFullyBooked: false
      }
    }

    try {
      const dayBookings = bookings.filter(
        b => b.cageId === cageId && 
        (b.status === 'confirmed' || b.status === 'pending') &&
        date >= b.startDate && date <= b.endDate
      )

      const bookedSlots: { startTime: string; endTime: string; booking: Booking }[] = []

      for (const booking of dayBookings) {
        bookedSlots.push({
          startTime: booking.startTime,
          endTime: booking.endTime,
          booking
        })
      }

      return {
        hasBookings: dayBookings.length > 0,
        bookedSlots,
        isFullyBooked: dayBookings.length > 0
      }
    } catch (error) {
      console.error('[useCageAvailability] 获取可用状态出错:', error)
      return {
        hasBookings: false,
        bookedSlots: [],
        isFullyBooked: false
      }
    }
  }, [cageId, date, bookings])

  return result
}
