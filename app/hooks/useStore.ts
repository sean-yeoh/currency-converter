import { create } from 'zustand'

interface StoreState {
  currenciesData: any
  setCurrenciesData: (currenciesData: any) => void
  from: string
  setFrom: (val: string) => void
  to: string
  setTo: (val: string) => void
  fromAmount: number | null
  setFromAmount: (val: number | null) => void
  toAmount: number | null
  setToAmount: (val: number | null) => void
}

const useStore = create<StoreState>()((set) => ({
  currenciesData: {},
  setCurrenciesData: (currenciesData) =>
    set((_state) => ({ currenciesData: { ...currenciesData } })),
  from: '',
  setFrom: (val) => set((_state) => ({ from: val })),
  to: '',
  setTo: (val) => set((_state) => ({ to: val })),
  fromAmount: null,
  setFromAmount: (val) => set((_state) => ({ fromAmount: val })),
  toAmount: null,
  setToAmount: (val) => set((_state) => ({ toAmount: val })),
}))
export { useStore }
