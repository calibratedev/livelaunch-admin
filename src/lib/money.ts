import currency from 'currency.js'

export function formatMoney(amount: number, isCent = false) {
  const c = currency(amount, {
    symbol: '$',
    decimal: '.',
    separator: ',',
  })

  if (isCent) {
    return c.divide(100).format()
  }

  return c.format()
}
