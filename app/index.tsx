import { View, ScrollView, RefreshControl } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { CurrencySelection } from './components/CurrencySelection'
import { Repeat } from '~/lib/icons/Repeat'
import { useStore, CurrenciesData, Currencies } from './hooks/useStore'
import { Text } from '~/components/ui/text'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { CircleDollarSign } from '~/lib/icons/CircleDollarSign'
import { Button } from '~/components/ui/button'
import {
  calculateExchangeRate,
  daysBetween,
  normalizeCurrenciesData,
} from '~/lib/utils'

const fetchCurrencies = async () => {
  const response = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
  )

  const json = (await response.json()) as CurrenciesData
  const normalizedData = normalizeCurrenciesData(json)
  await AsyncStorage.setItem('currencies', JSON.stringify(normalizedData))

  return normalizedData
}

export default function Screen() {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(0)
  const setCurrencies = useStore((state) => state.setCurrencies)
  const setRecentCurrencies = useStore((state) => state.setRecentCurrencies)
  const currencies = useStore((state) => state.currencies)

  const from = useStore((state) => state.from)
  const to = useStore((state) => state.to)
  const fromAmount = useStore((state) => state.fromAmount)
  const toAmount = useStore((state) => state.toAmount)

  const setFrom = useStore((state) => state.setFrom)
  const setFromAmount = useStore((state) => state.setFromAmount)
  const setTo = useStore((state) => state.setTo)
  const setToAmount = useStore((state) => state.setToAmount)

  const getCurrencies = async () => {
    try {
      const storedCurrencies = await AsyncStorage.getItem('currencies')
      let data: Currencies

      if (storedCurrencies !== null) {
        data = JSON.parse(storedCurrencies)
        const storedDate = data.date
        const currentDate = new Date().toISOString().split('T')[0]
        const days = daysBetween(storedDate, currentDate)

        // refresh currencies
        if (days >= 1) {
          try {
            data = await fetchCurrencies()
          } catch {
            // Use old currencies if failed to update
            data = data
          }
        }
      } else {
        data = await fetchCurrencies()
      }

      setCurrencies(data)
      await loadDefaults(data.rates)
    } catch (e) {
      setIsError(true)
    }

    setIsLoading(false)
  }

  const loadDefaults = async (rates: Currencies['rates']) => {
    const asyncStorageFrom = await AsyncStorage.getItem('from')
    const asyncStorageTo = await AsyncStorage.getItem('to')
    const asyncStorageFromAmount = await AsyncStorage.getItem('fromAmount')
    const asyncStorageToAmount = await AsyncStorage.getItem('toAmount')

    if (asyncStorageFrom) {
      setFrom(asyncStorageFrom)
    }

    if (asyncStorageTo) {
      setTo(asyncStorageTo)
    }

    if (asyncStorageFromAmount) {
      setFromAmount(parseFloat(asyncStorageFromAmount))
    }

    if (asyncStorageToAmount) {
      setToAmount(parseFloat(asyncStorageToAmount))
    }

    if (asyncStorageFrom && asyncStorageTo) {
      setExchangeRate(
        calculateExchangeRate(rates, asyncStorageFrom, asyncStorageTo),
      )
    }
  }

  const getRecentCurrencies = async () => {
    let recentCurrencies = []

    try {
      const storedRecentCurrencies = await AsyncStorage.getItem(
        'recentCurrencies',
      )

      if (storedRecentCurrencies !== null) {
        recentCurrencies = JSON.parse(storedRecentCurrencies)
      }
    } catch (e) {
      recentCurrencies = []
    }

    setRecentCurrencies(recentCurrencies)
  }

  useEffect(() => {
    getCurrencies()
    getRecentCurrencies()
  }, [])

  useEffect(() => {
    if (currencies && from && to) {
      const rates = currencies.rates

      setExchangeRate(calculateExchangeRate(rates, from, to))
    }
  }, [from, to])

  const switchCurrency = () => {
    setFrom(to)
    setFromAmount(toAmount)
    setTo(from)
    setToAmount(fromAmount)
  }

  const onRefresh = async () => {
    setIsLoading(true)

    try {
      await getCurrencies()
      setIsError(false)
    } catch {
      setIsError(true)
    }

    setIsLoading(false)
  }

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {isError ? (
            <ScrollView
              contentContainerClassName="flex-1 justify-center"
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
              }
            >
              <Text className="text-destructive">
                Oops! We couldn't load any currencies. Please check your
                internet connection or try again later.
              </Text>
            </ScrollView>
          ) : (
            <View className="flex-1 justify-center items-center gap-5 relative">
              <View className="absolute bg-sky-200 right-0 top-0"></View>

              <CurrencySelection type="from" exchangeRate={exchangeRate} />

              <Button
                size="icon"
                variant="secondary"
                className="rounded-lg"
                onPress={switchCurrency}
              >
                <Repeat
                  className="text-foreground"
                  size={23}
                  strokeWidth={1.25}
                />
              </Button>

              <CurrencySelection type="to" exchangeRate={exchangeRate} />

              {from && to && exchangeRate ? (
                <Alert
                  icon={CircleDollarSign}
                  className="bg-accent text-primary"
                >
                  <AlertTitle className="-mb-1">
                    1 {from} = {exchangeRate.toFixed(4)} {to}
                  </AlertTitle>
                </Alert>
              ) : null}
            </View>
          )}
        </>
      )}
    </View>
  )
}
