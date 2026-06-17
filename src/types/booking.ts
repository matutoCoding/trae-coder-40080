export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected'

export interface Booking {
  id: string
  cageId: string
  cageNo: string
  researchGroup: string
  projectName: string
  researcher: string
  phone: string
  animalType: string
  animalCount: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  purpose: string
  status: BookingStatus
  remarks?: string
  createTime: string
  updateTime: string
  cancelReason?: string
  cancelTime?: string
}

export interface BookingFormData {
  cageId: string
  researchGroup: string
  projectName: string
  researcher: string
  phone: string
  animalType: string
  animalCount: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  purpose: string
  remarks?: string
}

export interface ConflictResult {
  hasConflict: boolean
  conflictingBookings: Booking[]
  conflictMessage: string
}
