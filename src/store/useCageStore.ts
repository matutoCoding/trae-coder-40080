import { create } from 'zustand'
import type { Cage, CageType, CageStatus } from '@/types/cage'
import { cageList, getCageById } from '@/data/cageData'

interface CageState {
  cages: Cage[]
  selectedCage: Cage | null
  filterType: CageType | 'all'
  filterStatus: CageStatus | 'all'
  searchKeyword: string
  setSelectedCage: (cage: Cage | null) => void
  setFilterType: (type: CageType | 'all') => void
  setFilterStatus: (status: CageStatus | 'all') => void
  setSearchKeyword: (keyword: string) => void
  getFilteredCages: () => Cage[]
  getCageById: (id: string) => Cage | undefined
  refreshCages: () => void
}

export const useCageStore = create<CageState>((set, get) => ({
  cages: cageList,
  selectedCage: null,
  filterType: 'all',
  filterStatus: 'all',
  searchKeyword: '',

  setSelectedCage: (cage) => set({ selectedCage: cage }),
  
  setFilterType: (type) => set({ filterType: type }),
  
  setFilterStatus: (status) => set({ filterStatus: status }),
  
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  getFilteredCages: () => {
    const { cages, filterType, filterStatus, searchKeyword } = get()
    return cages.filter(cage => {
      if (filterType !== 'all' && cage.type !== filterType) return false
      if (filterStatus !== 'all' && cage.status !== filterStatus) return false
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase()
        return (
          cage.cageNo.toLowerCase().includes(keyword) ||
          cage.location.toLowerCase().includes(keyword) ||
          cage.type.toLowerCase().includes(keyword) ||
          cage.specification.toLowerCase().includes(keyword)
        )
      }
      return true
    })
  },
  
  getCageById: (id) => getCageById(id),
  
  refreshCages: () => {
    set({ cages: [...cageList] })
  }
}))
