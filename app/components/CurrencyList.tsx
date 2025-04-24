import React, { useState, useEffect, useRef } from 'react'
import { CurrenciesData, useStore, Currencies } from '../hooks/useStore'
import { X } from '~/lib/icons/X'
import { View, FlatList, Text, TouchableOpacity } from 'react-native'
import { Input } from '~/components/ui/input'
import { calculateExchangeRate } from '~/lib/utils'

type CurrencyListProps = {
  currency: string
  closeDialog: () => void
  setCurrency: (val: string) => void
  type: 'from' | 'to'
}

type Item = {
  title: string
  description: string
}

const CurrencyList = ({
  currency,
  closeDialog,
  setCurrency,
  type,
}: CurrencyListProps) => {
  const [searchText, setSearchText] = useState('')
  const from = useStore((state) => state.from)
  const to = useStore((state) => state.to)

  const rates =
    useStore((state) => state.currencies?.rates) || ({} as Currencies['rates'])
  const currencies = Object.keys(rates).map((code) => {
    const currency = rates[code]

    return {
      title: code,
      description: currency.name,
    }
  })

  const [filteredData, setFilteredData] = useState(currencies)

  const fromAmount = useStore((state) => state.fromAmount)
  const toAmount = useStore((state) => state.toAmount)
  const setFromAmount = useStore((state) => state.setFromAmount)
  const setToAmount = useStore((state) => state.setToAmount)

  const [focused, setFocused] = useState(false)

  const selectCurrency = (currency: string) => {
    if (rates) {
      setCurrency(currency)

      let fromRate: string
      let toRate: string

      if (type === 'from') {
        fromRate = currency
        toRate = to
      } else {
        fromRate = from
        toRate = currency
      }

      const exchangeRate = calculateExchangeRate(rates, fromRate, toRate)

      if (fromAmount && !toAmount) {
        setToAmount(parseFloat((fromAmount * exchangeRate).toFixed(2)))
      } else if (!fromAmount && toAmount) {
        setFromAmount(parseFloat((toAmount / exchangeRate).toFixed(2)))
      } else if (type === 'from' && fromAmount) {
        setToAmount(parseFloat((fromAmount * exchangeRate).toFixed(2)))
      } else if (type === 'to' && toAmount) {
        setFromAmount(parseFloat((toAmount / exchangeRate).toFixed(2)))
      }
    }

    closeDialog()
  }

  let index = 0

  // const item = currencies.find((i) => i.value === currency)

  // if (item) {
  //   index = currencies.indexOf(item)
  // }

  useEffect(() => {
    // Filter the data based on search text
    if (rates) {
      const filtered = currencies.filter((currency) => {
        const searchTerm = searchText.toLowerCase()

        return (
          currency.title.toLowerCase().includes(searchTerm) ||
          currency.description.toLowerCase().includes(searchTerm)
        )
      })

      setFilteredData(filtered)
    }
  }, [searchText])

  const clearSearch = () => {
    setSearchText('')
  }

  const flatListRef = useRef<FlatList<Item>>(null)

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      className={`px-3 rounded-lg py-4 ${
        item.title === currency ? 'bg-accent text-accent-foreground' : ''
      }`}
      onPress={() => selectCurrency(item.title)}
    >
      <Text className="text-foreground text-2xl">{item.title}</Text>
      <Text className="text-muted-foreground">{item.description}</Text>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 w-[300]">
      <View>
        <Input
          className={`w-fullg border mb-4 ${
            focused ? 'border-primary' : 'border-border'
          }`}
          placeholder="Search for a currency"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCorrect={false}
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
        keyExtractor={(item) => item.title}
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
