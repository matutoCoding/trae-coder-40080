import { create } from 'zustand'
import type { Booking, BookingFormData, BookingStatus } from '@/types/booking'
import { bookingList, createBooking as dataCreateBooking, cancelBooking as dataCancelBooking, getMyBookings } from '@/data/bookingData'
import { getCageById } from '@/data/cageData'

interface BookingState {
  bookings: Booking[]
  selectedBooking: Booking | null
  filterStatus: BookingStatus | 'all'
  currentResearcher: string
  setSelectedBooking: (booking: Booking | null) => void
  setFilterStatus: (status: BookingStatus | 'all') => void
  setCurrentResearcher: (researcher: string) => void
  getFilteredBookings: () => Booking[]
  getMyBookings: () => Booking[]
  getActiveBookingsByCageId: (cageId: string) => Booking[]
  createBooking: (data: BookingFormData) => Booking | null
  cancelBooking: (id: string, reason: string) => boolean
  refreshBookings: () => void
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [...bookingList],
  selectedBooking: null,
  filterStatus: 'all',
  currentResearcher: '',

  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  
  setFilterStatus: (status) => set({ filterStatus: status }),
  
  setCurrentResearcher: (researcher) => set({ currentResearcher: researcher }),
  
  getFilteredBookings: () => {
    const { bookings, filterStatus, currentResearcher } = get()
    return bookings.filter(booking => {
      if (filterStatus !== 'all' && booking.status !== filterStatus) return false
      if (currentResearcher && booking.researcher !== currentResearcher) return false
      return true
    }).sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
  },
  
  getMyBookings: () => {
    const { currentResearcher, bookings } = get()
    let filtered = bookings
    if (currentResearcher) {
      filtered = bookings.filter(b => b.researcher === currentResearcher)
    }
    return filtered.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
  },

  getActiveBookingsByCageId: (cageId: string) => {
    const { bookings } = get()
    return bookings.filter(
      booking => booking.cageId === cageId && 
      (booking.status === 'confirmed' || booking.status === 'pending')
    )
  },
  
  createBooking: (data) => {
    const cage = getCageById(data.cageId)
    if (!cage) {
      console.error('[BookingStore] 笼位不存在:', data.cageId)
      return null
    }

    const newBooking = dataCreateBooking({
      ...data,
      cageNo: cage.cageNo
    })
    
    if (newBooking) {
      set(state => ({ bookings: [...state.bookings, newBooking] }))
    }
    
    return newBooking
  },
  
  cancelBooking: (id, reason) => {
    const success = dataCancelBooking(id, reason)
    if (success) {
      set(state => ({
        bookings: state.bookings.map(b => 
          b.id === id 
            ? { ...b, status: 'cancelled' as BookingStatus, cancelReason: reason, cancelTime: new Date().toISOString(), updateTime: new Date().toISOString() }
            : b
        )
      }))
    }
    return success
  },
  
  refreshBookings: () => {
    set({ bookings: [...bookingList] })
  }
}))
