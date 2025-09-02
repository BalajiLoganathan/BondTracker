import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { MASTER_FIELDS, months, calcAccumulatedForRow, generateEmptyRow } from './schema.js'

export async function exportToExcel(rows) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('BondTracker')
  const headers = [...MASTER_FIELDS, ...months, 'Accumulated_Amount']
  ws.addRow(headers)

  rows.forEach((r) => {
    const row = []
    MASTER_FIELDS.forEach(f => row.push(r[f] ?? ''))
    months.forEach(m => row.push(Number(r[m] || 0)))
    row.push(calcAccumulatedForRow(r))
    ws.addRow(row)
  })

  // TOTAL row with formulas
  const total = []
  headers.forEach(h => {
    if (h === 'Bond') total.push('TOTAL')
    else if (h === 'Invested_Amount' || h === 'Accumulated_Amount' || months.includes(h)) {
      const col = headers.indexOf(h) + 1
      const start = 2
      const end = rows.length + 1
      total.push({ formula: `SUM(${colLetter(col)}${start}:${colLetter(col)}${end})` })
    } else total.push('')
  })
  ws.addRow(total)

  // Freeze: header row + master columns
  ws.views = [{ state: 'frozen', xSplit: MASTER_FIELDS.length, ySplit: 1 }]
  ws.columns.forEach((c) => { c.width = Math.max(12, (c.header?.length || 12) * 0.9) })

  const buf = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buf]), 'BondTracker.xlsx')
}

export async function importFromExcel(file) {
  const wb = new ExcelJS.Workbook()
  const buf = await file.arrayBuffer()
  await wb.xlsx.load(buf)
  const ws = wb.worksheets[0]
  if (!ws) return []

  const headers = []
  ws.getRow(1).eachCell((cell) => headers.push(String(cell.value)))

  const out = []
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const first = getCellString(row.getCell(1))
    if (first === 'TOTAL') return
    const obj = {}
    headers.forEach((h, i) => {
      const cell = row.getCell(i + 1)
      const val = cellValue(cell)
      obj[h] = months.includes(h) || h === 'Invested_Amount' ? Number(val || 0) : (val ?? '')
    })
    out.push(obj)
  })

  // ensure defaults for any missing cols
  return out.map(r => {
    const base = generateEmptyRow()
    Object.keys(r).forEach(k => { if (k in base) base[k] = r[k] })
    return base
  })
}

function colLetter(n) {
  let s = ''
  while (n > 0) {
    const m = (n - 1) % 26
    s = String.fromCharCode(65 + m) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}
function getCellString(cell) {
  if (!cell) return ''
  const v = cell.value
  if (v == null) return ''
  if (typeof v === 'object' && 'text' in v) return v.text
  return String(v)
}
function cellValue(cell) {
  if (!cell) return ''
  const v = cell.value
  if (v == null) return ''
  if (typeof v === 'object') {
    if (v.text) return v.text
    if (v.result != null) return v.result
    if (v.richText) return v.richText.map(t => t.text).join('')
  }
  return v
}
