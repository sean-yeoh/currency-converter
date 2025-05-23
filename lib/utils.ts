import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CurrenciesData, Currencies } from '../app/hooks/useStore'
import CommonCurrencies from '~/lib/common-currency.json'

const daysBetween = (d1: string | Date, d2: string | Date) => {
  const diff = Math.abs(new Date(d2).valueOf() - new Date(d1).valueOf())
  return diff / (1000 * 60 * 60 * 24)
}

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

const calculateExchangeRate = (
  rates: Currencies['rates'],
  from: string,
  to: string,
) => {
  const fromRate = rates[from]
  const toRate = rates[to]
  const fromRateToUsd = 1 / fromRate.rate
  const toRateToUsd = 1 / toRate.rate

  return fromRateToUsd / toRateToUsd
}

const normalizeCurrenciesData = (currenciesData: CurrenciesData) => {
  const rates = Object.keys(CommonCurrencies).reduce(
    (acc: Currencies['rates'], code: string) => {
      const rate = currenciesData.usd[code.toLowerCase()]

      const commonCurrency =
        CommonCurrencies[code as keyof typeof CommonCurrencies]

      if (rate) {
        acc[code] = {
          name: commonCurrency.name,
          rate,
        }
      }

      return acc
    },
    {},
  )

  return {
    date: currenciesData.date,
    rates: rates,
  }
}

export { calculateExchangeRate, cn, normalizeCurrenciesData, daysBetween }
