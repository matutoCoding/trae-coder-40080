import type { Booking } from '@/types/booking'
import { v4 as uuidv4 } from 'uuid'

export const bookingList: Booking[] = [
  {
    id: 'booking-001',
    cageId: 'cage-002',
    cageNo: 'A-102',
    researchGroup: '肿瘤生物学课题组',
    projectName: '抗肿瘤药物筛选研究',
    researcher: '张三',
    phone: '13800138001',
    animalType: 'BALB/c小鼠',
    animalCount: 6,
    startDate: '2025-06-18',
    endDate: '2025-07-18',
    startTime: '08:00',
    endTime: '20:00',
    purpose: '药物毒性实验，需要观察4周',
    status: 'confirmed',
    createTime: '2025-06-10 14:30:00',
    updateTime: '2025-06-10 15:00:00'
  },
  {
    id: 'booking-002',
    cageId: 'cage-004',
    cageNo: 'A-201',
    researchGroup: '免疫学课题组',
    projectName: '自身免疫性疾病模型建立',
    researcher: '李四',
    phone: '13800138002',
    animalType: '新西兰大白兔',
    animalCount: 1,
    startDate: '2025-06-15',
    endDate: '2025-07-15',
    startTime: '08:00',
    endTime: '20:00',
    purpose: '诱导关节炎模型，观察8周',
    status: 'confirmed',
    createTime: '2025-06-08 10:00:00',
    updateTime: '2025-06-08 10:30:00'
  },
  {
    id: 'booking-003',
    cageId: 'cage-001',
    cageNo: 'A-101',
    researchGroup: '神经生物学课题组',
    projectName: '神经退行性疾病研究',
    researcher: '王五',
    phone: '13800138003',
    animalType: 'C57BL/6小鼠',
    animalCount: 8,
    startDate: '2025-06-20',
    endDate: '2025-08-20',
    startTime: '08:00',
    endTime: '20:00',
    purpose: '行为学实验，需要长期观察',
    status: 'pending',
    createTime: '2025-06-17 09:00:00',
    updateTime: '2025-06-17 09:00:00'
  },
  {
    id: 'booking-004',
    cageId: 'cage-003',
    cageNo: 'A-103',
    researchGroup: '药理学课题组',
    projectName: '新药代谢动力学研究',
    researcher: '赵六',
    phone: '13800138004',
    animalType: 'SD大鼠',
    animalCount: 3,
    startDate: '2025-06-25',
    endDate: '2025-07-25',
    startTime: '08:00',
    endTime: '20:00',
    purpose: '药物代谢实验，采血样分析',
    status: 'pending',
    createTime: '2025-06-16 16:00:00',
    updateTime: '2025-06-16 16:00:00'
  },
  {
    id: 'booking-005',
    cageId: 'cage-002',
    cageNo: 'A-102',
    researchGroup: '遗传学课题组',
    projectName: '基因编辑小鼠表型分析',
    researcher: '钱七',
    phone: '13800138005',
    animalType: '基因编辑小鼠',
    animalCount: 5,
    startDate: '2025-07-20',
    endDate: '2025-10-20',
    startTime: '08:00',
    endTime: '20:00',
    purpose: '表型观察和繁殖',
    status: 'pending',
    createTime: '2025-06-15 11:00:00',
    updateTime: '2025-06-15 11:00:00'
  },
  {
    id: 'booking-006',
    cageId: 'cage-001',
    cageNo: 'A-101',
    researchGroup: '微生物学课题组',
    projectName: '肠道菌群与健康研究',
    researcher: '孙八',
    phone: '13800138006',
    animalType: '无菌小鼠',
    animalCount: 10,
    startDate: '2025-06-01',
    endDate: '2025-06-15',
    startTime: '08:00',
    endTime: '20:00',
    purpose: '菌群定植实验',
    status: 'completed',
    createTime: '2025-05-20 10:00:00',
    updateTime: '2025-06-15 18:00:00'
  },
  {
    id: 'booking-007',
    cageId: 'cage-005',
    cageNo: 'B-101',
    researchGroup: '毒理学课题组',
    projectName: '化妆品安全性评价',
    researcher: '周九',
    phone: '13800138007',
    animalType: '豚鼠',
    animalCount: 6,
    startDate: '2025-06-10',
    endDate: '2025-06-14',
    startTime: '08:00',
    endTime: '20:00',
    purpose: '皮肤过敏实验',
    status: 'cancelled',
    cancelReason: '实验方案调整',
    cancelTime: '2025-06-09 15:00:00',
    createTime: '2025-06-01 14:00:00',
    updateTime: '2025-06-09 15:00:00'
  }
]

export const getBookingById = (id: string): Booking | undefined => {
  return bookingList.find(booking => booking.id === id)
}

export const getBookingsByCageId = (cageId: string): Booking[] => {
  return bookingList.filter(booking => booking.cageId === cageId && booking.status !== 'cancelled')
}

export const getActiveBookingsByCageId = (cageId: string): Booking[] => {
  return bookingList.filter(
    booking => booking.cageId === cageId && 
    (booking.status === 'confirmed' || booking.status === 'pending')
  )
}

export const getMyBookings = (researcher?: string): Booking[] => {
  if (researcher) {
    return bookingList.filter(booking => booking.researcher === researcher)
  }
  return bookingList
}

export const createBooking = (data: Omit<Booking, 'id' | 'createTime' | 'updateTime' | 'status'>): Booking => {
  const newBooking: Booking = {
    ...data,
    id: uuidv4(),
    status: 'pending',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
  bookingList.unshift(newBooking)
  console.log('[Booking] 创建预约:', newBooking.id, newBooking.cageNo)
  return newBooking
}

export const cancelBooking = (id: string, reason: string): boolean => {
  const booking = bookingList.find(b => b.id === id)
  if (booking && (booking.status === 'pending' || booking.status === 'confirmed')) {
    booking.status = 'cancelled'
    booking.cancelReason = reason
    booking.cancelTime = new Date().toISOString()
    booking.updateTime = new Date().toISOString()
    console.log('[Booking] 取消预约:', id, '原因:', reason)
    return true
  }
  return false
}
