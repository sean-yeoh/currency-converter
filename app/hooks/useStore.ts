import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Currencies = {
  date: string
  rates: {
    [key: string]: {
      name: string
      rate: number
    }
  }
}

type CurrenciesData = {
  date: string
  usd: {
    [key: string]: number
  }
}

interface StoreState {
  currencies: Currencies | null
  setCurrencies: (val: Currencies) => void
  recentCurrencies: string[]
  setRecentCurrencies: (val: string[]) => void
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
  currencies: null,
  setCurrencies: (val) => set((_state) => ({ currencies: { ...val } })),
  recentCurrencies: [],
  setRecentCurrencies: async (val) => {
    set((_state) => ({ recentCurrencies: [...val] }))
    await AsyncStorage.setItem('recentCurrencies', JSON.stringify([...val]))
  },
  from: '',
  setFrom: async (val) => {
    set((_state) => ({ from: val }))
    await AsyncStorage.setItem('from', val)
  },
  to: '',
  setTo: async (val) => {
    set((_state) => ({ to: val }))
    await AsyncStorage.setItem('to', val)
  },
  fromAmount: null,
  setFromAmount: async (val) => {
    set((_state) => ({ fromAmount: val }))
    if (val) {
      await AsyncStorage.setItem('fromAmount', val.toString())
    }
  },
  toAmount: null,
  setToAmount: async (val) => {
    set((_state) => ({ toAmount: val }))
    if (val) {
      await AsyncStorage.setItem('toAmount', val.toString())
    }
  },
}))

export { useStore }
export type { CurrenciesData, Currencies }
