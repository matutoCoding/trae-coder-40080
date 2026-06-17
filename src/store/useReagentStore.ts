import { create } from 'zustand'
import type { Reagent, ReagentBatch, ReagentCategory, BatchInboundForm } from '@/types/reagent'
import { reagentList, batchList, getReagentById, getBatchesByReagentId, addBatch, checkAndLockExpiredBatches } from '@/data/reagentData'

interface ReagentState {
  reagents: Reagent[]
  batches: ReagentBatch[]
  selectedReagent: Reagent | null
  selectedBatch: ReagentBatch | null
  filterCategory: ReagentCategory | 'all'
  filterExpiry: 'all' | 'normal' | 'expiring' | 'expired'
  searchKeyword: string
  setSelectedReagent: (reagent: Reagent | null) => void
  setSelectedBatch: (batch: ReagentBatch | null) => void
  setFilterCategory: (category: ReagentCategory | 'all') => void
  setFilterExpiry: (filter: 'all' | 'normal' | 'expiring' | 'expired') => void
  setSearchKeyword: (keyword: string) => void
  getFilteredReagents: () => Reagent[]
  getReagentById: (id: string) => Reagent | undefined
  getBatchesByReagentId: (reagentId: string) => ReagentBatch[]
  addBatch: (form: BatchInboundForm) => ReagentBatch | null
  checkExpiredBatches: () => number
  refreshReagents: () => void
  refreshBatches: () => void
}

export const useReagentStore = create<ReagentState>((set, get) => ({
  reagents: reagentList,
  batches: batchList,
  selectedReagent: null,
  selectedBatch: null,
  filterCategory: 'all',
  filterExpiry: 'all',
  searchKeyword: '',

  setSelectedReagent: (reagent) => set({ selectedReagent: reagent }),
  
  setSelectedBatch: (batch) => set({ selectedBatch: batch }),
  
  setFilterCategory: (category) => set({ filterCategory: category }),
  
  setFilterExpiry: (filter) => set({ filterExpiry: filter }),
  
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  getFilteredReagents: () => {
    const { reagents, filterCategory, filterExpiry, searchKeyword } = get()
    return reagents.filter(reagent => {
      if (filterCategory !== 'all' && reagent.category !== filterCategory) return false
      
      if (filterExpiry === 'expired' && reagent.expiredCount === 0) return false
      if (filterExpiry === 'expiring' && reagent.expiringCount === 0) return false
      if (filterExpiry === 'normal' && (reagent.expiringCount > 0 || reagent.expiredCount > 0)) return false
      
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase()
        return (
          reagent.name.toLowerCase().includes(keyword) ||
          reagent.category.toLowerCase().includes(keyword) ||
          reagent.manufacturer.toLowerCase().includes(keyword) ||
          reagent.specification.toLowerCase().includes(keyword)
        )
      }
      return true
    })
  },
  
  getReagentById: (id) => getReagentById(id),
  
  getBatchesByReagentId: (reagentId) => getBatchesByReagentId(reagentId),
  
  addBatch: (form) => {
    const reagent = getReagentById(form.reagentId)
    if (!reagent) {
      console.error('[ReagentStore] 试剂不存在:', form.reagentId)
      return null
    }

    const newBatch = addBatch({
      ...form,
      reagentName: reagent.name,
      unit: reagent.unit,
      receiveDate: new Date().toISOString().split('T')[0]
    })
    
    if (newBatch) {
      set({ 
        reagents: [...reagentList],
        batches: [...batchList]
      })
    }
    
    return newBatch
  },
  
  checkExpiredBatches: () => {
    const lockedCount = checkAndLockExpiredBatches()
    if (lockedCount > 0) {
      set({ 
        reagents: [...reagentList],
        batches: [...batchList]
      })
    }
    return lockedCount
  },
  
  refreshReagents: () => {
    set({ reagents: [...reagentList] })
  },
  
  refreshBatches: () => {
    set({ batches: [...batchList] })
  }
}))
