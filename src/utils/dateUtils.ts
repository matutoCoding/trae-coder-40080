import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import type { ExpiryStatus } from '@/types/reagent'

dayjs.extend(isBetween)

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format)
}

export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD')
}

export const getDaysDiff = (date1: string | Date, date2: string | Date): number => {
  return dayjs(date1).diff(dayjs(date2), 'day')
}

export const getExpiryDays = (expiryDate: string | Date): number => {
  return dayjs(expiryDate).diff(dayjs(), 'day')
}

export const getExpiryStatus = (expiryDate: string | Date): ExpiryStatus => {
  const days = getExpiryDays(expiryDate)
  if (days < 0) return 'expired'
  if (days <= 7) return 'expiring_7'
  if (days <= 15) return 'expiring_15'
  if (days <= 30) return 'expiring_30'
  return 'normal'
}

export const getExpiryStatusText = (status: ExpiryStatus): string => {
  const statusMap: Record<ExpiryStatus, string> = {
    normal: '正常',
    expiring_30: '30天内到期',
    expiring_15: '15天内到期',
    expiring_7: '7天内到期',
    expired: '已过期'
  }
  return statusMap[status]
}

export const isDateOverlap = (
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean => {
  const s1 = dayjs(start1)
  const e1 = dayjs(end1)
  const s2 = dayjs(start2)
  const e2 = dayjs(end2)
  return s1.isBefore(e2) && s2.isBefore(e1)
}

export const isTimeOverlap = (
  date1: string,
  startTime1: string,
  endTime1: string,
  date2: string,
  startTime2: string,
  endTime2: string
): boolean => {
  if (date1 !== date2) return false
  const s1 = dayjs(`${date1} ${startTime1}`)
  const e1 = dayjs(`${date1} ${endTime1}`)
  const s2 = dayjs(`${date2} ${startTime2}`)
  const e2 = dayjs(`${date2} ${endTime2}`)
  return s1.isBefore(e2) && s2.isBefore(e1)
}

export const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = []
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  return dates
}

export const generateTimeSlots = (
  date: string,
  startHour: number = 8,
  endHour: number = 20,
  interval: number = 2
): { startTime: string; endTime: string }[] => {
  const slots: { startTime: string; endTime: string }[] = []
  for (let hour = startHour; hour < endHour; hour += interval) {
    slots.push({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + interval).toString().padStart(2, '0')}:00`
    })
  }
  return slots
}
