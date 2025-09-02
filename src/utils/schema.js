import { monthLabel, parseISODateOnly, parseMonthLabel, sameMonth } from './date.js'

// 96 months from Jan-2022 → Dec-2029
export const months = (() => {
  const list = []
  let y = 2022, m = 0
  for (let i = 0; i < 96; i++) {
    list.push(monthLabel(y, m))
    m++; if (m === 12) { m = 0; y++ }
  }
  return list
})()

// Master fields (your exact labels)
export const MASTER_FIELDS = [
  'Bond',
  'Expected_Interest_Month_Date',
  'Interest_Rate',
  'Interest_Frequency',
  'BondAmount',
  'Invested_Amount',
  'MaturityDate',
  'Platform',
  'Account',
  'BankAccount',
  'BondPurchaseType',
  'Status',
  'Settlement Date',
  'ISIN',
  'Closed?',
  'Comment',
]

export function generateEmptyRow() {
  const row = {}
  MASTER_FIELDS.forEach(f => row[f] = '')
  row['Expected_Interest_Month_Date'] = '1'
  row['Interest_Frequency'] = 'Monthly'
  row['Closed?'] = 'No'
  row['Invested_Amount'] = 0
  row['BondAmount'] = 0
  months.forEach(m => row[m] = 0)
  row['Accumulated_Amount'] = 0
  return row
}

// Running sum up to maturity (inclusive)
export function calcAccumulatedForRow(row) {
  const maturity = parseISODateOnly(row['MaturityDate'])
  let sum = 0
  for (const m of months) {
    const md = parseMonthLabel(m)
    if (!maturity || md <= maturity) sum += Number(row[m] || 0)
  }
  return sum
}

export function maturityClassesForCell(row, monthLabelStr) {
  const maturity = parseISODateOnly(row['MaturityDate'])
  if (!maturity) return ''
  const mDate = parseMonthLabel(monthLabelStr)
  if (sameMonth(mDate, new Date(maturity.getFullYear(), maturity.getMonth(), 1))) return 'maturity-cell'
  if (mDate > maturity) return 'post-maturity-cell'
  return ''
}
