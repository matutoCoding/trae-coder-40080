export type CageType = '小鼠笼' | '大鼠笼' | '兔笼' | '豚鼠笼' | '其他'

export type CageStatus = 'available' | 'booked' | 'maintenance' | 'cleaning'

export interface Cage {
  id: string
  cageNo: string
  type: CageType
  location: string
  floor: string
  room: string
  capacity: number
  currentAnimals: number
  status: CageStatus
  specification: string
  remarks?: string
  equipment?: string[]
  createTime: string
  updateTime: string
}

export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  status: 'available' | 'booked' | 'partial'
  bookingId?: string
}

export interface CageWithTimeSlots extends Cage {
  timeSlots: TimeSlot[]
}
