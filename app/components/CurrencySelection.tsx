import { View, TouchableOpacity } from 'react-native'
import { Button } from '~/components/ui/button'
import { Text } from '~/components/ui/text'
import { Input } from '~/components/ui/input'
import { ChevronDown } from '~/lib/icons/ChevronDown'
import { CurrencyList } from './CurrencyList'
import { X } from '~/lib/icons/X'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

import { useStore } from '../hooks/useStore'
import { useEffect, useState } from 'react'

type CurrencySelectionProps = {
  type: 'from' | 'to'
  exchangeRate: number
}

const REGEX = /^[0-9]*\.?[0-9]*$/

const CurrencySelection = ({ type, exchangeRate }: CurrencySelectionProps) => {
  const from = useStore((state) => state.from)
  const to = useStore((state) => state.to)
  const setFromAmount = useStore((state) => state.setFromAmount)
  const setToAmount = useStore((state) => state.setToAmount)
  let currency: string
  let setCurrency: (val: string) => void
  let currencyAmount: number | null
  let setCurrencyAmount: (val: number | null) => void

  if (type === 'from') {
    currency = from || 'FROM'
    setCurrency = useStore((state) => state.setFrom)
    currencyAmount = useStore((state) => state.fromAmount)
    setCurrencyAmount = setFromAmount
  } else {
    currency = to || 'TO'
    setCurrency = useStore((state) => state.setTo)
    currencyAmount = useStore((state) => state.toAmount)
    setCurrencyAmount = setToAmount
  }

  const [amountText, setAmountText] = useState(
    currencyAmount ? currencyAmount.toString() : '',
  )

  const [focused, setFocused] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)

  const closeDialog = () => {
    setDialogOpen(false)
  }

  useEffect(() => {
    setAmountText(currencyAmount ? currencyAmount.toString() : '')
  }, [currencyAmount])

  return (
    <View
      className={`w-full flex flex-row border-2 rounded-md ${
        focused ? 'border-primary' : 'border-border'
      }`}
    >
      <Dialog
        open={dialogOpen}
        className="flex-[1.75] rounded-tl-md rounded-bl-md"
      >
        <DialogTrigger asChild>
          <TouchableOpacity
            onPress={() => setDialogOpen(true)}
            className="bg-background pl-4 rounded-tl-md rounded-bl-md"
            style={{ height: 80 }}
          >
            <View
              className="relative flex-1 flex justify-center"
              style={{ height: 80 }}
            >
              <Text className="h-full" style={{ fontSize: 26, lineHeight: 78 }}>
                {currency.toUpperCase()}
              </Text>
              <ChevronDown className="absolute text-foreground right-1 top-[28]" />
            </View>
          </TouchableOpacity>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-[90%]">
          <Button
            onPress={closeDialog}
            onPressIn={closeDialog}
            variant="ghost"
            size="icon"
            className={'z-10 absolute right-4 top-4'}
          >
            <X size={18} className={'text-muted-foreground'} />
          </Button>

          <DialogHeader>
            <DialogTitle>Choose a currency</DialogTitle>
          </DialogHeader>

          <CurrencyList
            currency={currency}
            closeDialog={closeDialog}
            setCurrency={setCurrency}
            type={type}
          />
        </DialogContent>
      </Dialog>

      <Input
        style={{
          height: 80,
          fontSize: 36,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={(text) => {
          if (text.match(REGEX)) {
            setAmountText(text)

            const amount = parseFloat(text)

            if (!Number.isNaN(amount)) {
              setCurrencyAmount(amount)
            }

            if (exchangeRate) {
              if (type === 'from') {
                setToAmount(parseFloat((amount * exchangeRate).toFixed(2)))
              } else if (type === 'to') {
                setFromAmount(parseFloat((amount / exchangeRate).toFixed(2)))
              }
            }
          } else if (text.length === 0) {
            setCurrencyAmount(null)
            setAmountText(text)
            if (type === 'from') {
              setToAmount(null)
            } else if (type === 'to') {
              setFromAmount(null)
            }
          }
        }}
        className=" flex-[3] text-right pr-4 border-0 rounded-tl-none rounded-bl-none"
        autoComplete="off"
        inputMode="numeric"
        value={amountText}
      />
    </View>
  )
}

export { CurrencySelection }
