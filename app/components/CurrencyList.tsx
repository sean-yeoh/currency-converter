import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../hooks/useStore'
import { X } from '~/lib/icons/X'
import { View, FlatList, Text, TouchableOpacity } from 'react-native'
import { Input } from '~/components/ui/input'

type CurrencyListProps = {
  currency: string
  closeDialog: () => void
  setCurrency: (val: string) => void
  type: 'from' | 'to'
}

type Item = {
  id: string
  value: string
}

const CurrencyList = ({
  currency,
  closeDialog,
  setCurrency,
  type,
}: CurrencyListProps) => {
  const [searchText, setSearchText] = useState('')
  const currenciesData = useStore((state) => state.currenciesData)

  const from = useStore((state) => state.from)
  const to = useStore((state) => state.to)
  const fromAmount = useStore((state) => state.fromAmount)
  const toAmount = useStore((state) => state.toAmount)
  const setFromAmount = useStore((state) => state.setFromAmount)
  const setToAmount = useStore((state) => state.setToAmount)
  const currencies = Object.keys(currenciesData.rates).map((currency) => {
    return { id: currency, value: currency }
  })

  const [filteredData, setFilteredData] = useState(currencies)
  const [focused, setFocused] = useState(false)

  const selectCurrency = (currency: string) => {
    setCurrency(currency)
    const rates = currenciesData.rates
    let fromRate: number
    let toRate: number

    if (type === 'from') {
      fromRate = rates[currency]
      toRate = rates[to]
    } else {
      fromRate = rates[from]
      toRate = rates[currency]
    }

    const fromRateToUsd = 1 / fromRate
    const toRateToUsd = 1 / toRate
    const exchangeRate = fromRateToUsd / toRateToUsd

    if (fromAmount && !toAmount) {
      setToAmount(parseFloat((fromAmount * exchangeRate).toFixed(2)))
    } else if (!fromAmount && toAmount) {
      setFromAmount(parseFloat((toAmount / exchangeRate).toFixed(2)))
    } else if (type === 'from' && fromAmount) {
      setToAmount(parseFloat((fromAmount * exchangeRate).toFixed(2)))
    } else if (type === 'to' && toAmount) {
      setFromAmount(parseFloat((toAmount / exchangeRate).toFixed(2)))
    }

    closeDialog()
  }

  let index = 0

  const item = currencies.find((i) => i.value === currency)
  if (item) {
    index = currencies.indexOf(item)
  }

  useEffect(() => {
    // Filter the data based on search text
    const filtered = currencies.filter((currency) =>
      currency.value.toLowerCase().includes(searchText.toLowerCase()),
    )
    setFilteredData(filtered)
  }, [searchText])

  const clearSearch = () => {
    setSearchText('')
  }

  const flatListRef = useRef<FlatList<Item>>(null)

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      className={`px-3 rounded-lg py-4 ${
        item.value === currency ? 'bg-accent text-accent-foreground' : ''
      }`}
      onPress={() => selectCurrency(item.value)}
    >
      <Text className="text-foreground text-2xl">{item.value}</Text>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 w-[300]">
      <View>
        <Input
          className={`w-full uppercase border mb-4 ${
            focused ? 'border-primary' : 'border-border'
          }`}
          placeholder="Search for a currency"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            className="absolute top-4 right-3"
            onPress={clearSearch}
          >
            <X size={14} className="text-muted-foreground" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        ref={flatListRef}
        initialScrollIndex={index}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToIndex({ index: 0 })
        }}
        getItemLayout={(data, index) => ({
          length: 52,
          offset: 52 * index,
          index,
        })}
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="p-4 items-center">
            <Text className="text-muted-foreground text-lg">
              No results found
            </Text>
          </View>
        }
      />
    </View>
  )
}

export { CurrencyList }
