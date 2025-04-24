import { View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import currenciesData from '~/lib/currencies.json'
import { CurrencySelection } from './components/CurrencySelection'

import { useStore } from './hooks/useStore'
import { Text } from '~/components/ui/text'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { CircleDollarSign } from '~/lib/icons/CircleDollarSign'
// const storeData = async (value) => {
//   try {
//     await AsyncStorage.setItem('currencies', value)
//   } catch (e) {
//     // saving error
//   }
// }

const fetchCurrencies = async () => {
  await AsyncStorage.setItem('currencies', JSON.stringify(currenciesData))
}

export default function Screen() {
  const [isLoading, setIsLoading] = useState(true)
  const [exchangeRate, setExchangeRate] = useState(0)
  const setCurrenciesData = useStore((state) => state.setCurrenciesData)
  const currenciesData = useStore((state) => state.currenciesData)
  const currencies = currenciesData.rates
  const from = useStore((state) => state.from)
  const to = useStore((state) => state.to)

  useEffect(() => {
    const getCurrencies = async () => {
      try {
        const value = await AsyncStorage.getItem('currencies')
        let storedCurrencies

        if (value !== null) {
          storedCurrencies = JSON.parse(value)
        } else {
          await fetchCurrencies()
        }

        setCurrenciesData(storedCurrencies)

        // console.log('value', value)
      } catch (e) {
        console.log('e', e)

        // error reading value
      }

      setIsLoading(false)
    }

    getCurrencies()
  }, [])

  console.log('exchangeRate', exchangeRate)

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

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <CurrencySelection type="from" exchangeRate={exchangeRate} />
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
        </>
      )}
    </View>
  )
}
