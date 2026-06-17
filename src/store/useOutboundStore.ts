import { create } from 'zustand'
import type { OutboundRecord, OutboundFormData, FIFORecommendation } from '@/types/outbound'
import { outboundRecords, createOutbound as dataCreateOutbound, getFIFORecommendation } from '@/data/outboundData'

interface OutboundState {
  outboundRecords: OutboundRecord[]
  selectedOutbound: OutboundRecord | null
  currentRecommendations: FIFORecommendation[]
  setSelectedOutbound: (outbound: OutboundRecord | null) => void
  setCurrentRecommendations: (recommendations: FIFORecommendation[]) => void
  getOutboundRecords: () => OutboundRecord[]
  getFIFORecommendation: (reagentId: string, quantity: number) => FIFORecommendation
  createOutbound: (form: OutboundFormData) => OutboundRecord | null
  getOutboundById: (id: string) => OutboundRecord | undefined
  refreshOutboundRecords: () => void
}

export const useOutboundStore = create<OutboundState>((set, get) => ({
  outboundRecords: outboundRecords,
  selectedOutbound: null,
  currentRecommendations: [],

  setSelectedOutbound: (outbound) => set({ selectedOutbound: outbound }),
  
  setCurrentRecommendations: (recommendations) => set({ currentRecommendations: recommendations }),
  
  getOutboundRecords: () => {
    return [...outboundRecords].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    )
  },
  
  getFIFORecommendation: (reagentId, quantity) => {
    return getFIFORecommendation(reagentId, quantity)
  },
  
  createOutbound: (form) => {
    const newOutbound = dataCreateOutbound(form)
    if (newOutbound) {
      set({ 
        outboundRecords: [...outboundRecords],
        currentRecommendations: []
      })
    }
    return newOutbound
  },
  
  getOutboundById: (id) => {
    return outboundRecords.find(record => record.id === id)
  },
  
  refreshOutboundRecords: () => {
    set({ outboundRecords: [...outboundRecords] })
  }
}))
