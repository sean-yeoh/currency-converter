import { View, ScrollView, RefreshControl } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { CurrencySelection } from './components/CurrencySelection'
import { Repeat } from '~/lib/icons/Repeat'
import { useStore } from './hooks/useStore'
import { Text } from '~/components/ui/text'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { CircleDollarSign } from '~/lib/icons/CircleDollarSign'
import { Button } from '~/components/ui/button'

const daysBetween = (d1: string | Date, d2: string | Date) => {
  const diff = Math.abs(new Date(d2).valueOf() - new Date(d1).valueOf())
  return diff / (1000 * 60 * 60 * 24)
}

const fetchCurrencies = async () => {
  const response = await fetch('https://api.fxratesapi.com/latest')
  const json = await response.json()

  await AsyncStorage.setItem('currencies', JSON.stringify(json))

  return json
}

export default function Screen() {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(0)
  const setCurrenciesData = useStore((state) => state.setCurrenciesData)
  const currenciesData = useStore((state) => state.currenciesData)
  const currencies = currenciesData.rates
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
      const value = await AsyncStorage.getItem('currencies')
      let storedCurrencies

      if (value !== null) {
        storedCurrencies = JSON.parse(value)
        const storedDate = storedCurrencies.date
        const days = daysBetween(storedDate, new Date())

        // refresh currencies
        if (true || days >= 1) {
          try {
            storedCurrencies = await fetchCurrencies()
          } catch {
            // Use old currencies if failed to update
            storedCurrencies = storedCurrencies
          }
        }
      } else {
        storedCurrencies = await fetchCurrencies()
      }

      setCurrenciesData(storedCurrencies)
    } catch (e) {
      setIsError(true)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getCurrencies()
  }, [])

  useEffect(() => {
    if (from && to) {
      const fromRate = currencies[from]
      const toRate = currencies[to]

      const fromRateToUsd = 1 / fromRate
      const toRateToUsd = 1 / toRate
      const exchangeRate = fromRateToUsd / toRateToUsd
      setExchangeRate(exchangeRate)
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
                  className="bg-accent text-accent-foreground"
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
