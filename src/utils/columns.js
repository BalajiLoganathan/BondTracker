import { months, MASTER_FIELDS, calcAccumulatedForRow, maturityClassesForCell } from './schema.js'
import { parseISODateOnly, parseMonthLabel } from './date.js'

export function getColumnDefs() {
  const master = [
    { headerName: 'Bond', field: 'Bond', editable: true, pinned: 'left', minWidth: 160 },
    { headerName: 'Expected Interest Day', field: 'Expected_Interest_Month_Date',
      editable: true, pinned: 'left', minWidth: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: Array.from({length:31}, (_,i)=> String(i+1)) }
    },
    { headerName: 'Interest Rate %', field: 'Interest_Rate', editable: true, pinned: 'left', minWidth: 140 },
    { headerName: 'Interest Frequency', field: 'Interest_Frequency',
      editable: true, pinned: 'left', minWidth: 160,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'] }
    },
    { headerName: 'Bond Amount', field: 'BondAmount', editable: true, minWidth: 130 },
    { headerName: 'Invested Amount', field: 'Invested_Amount', editable: true, minWidth: 140 },
    { headerName: 'Maturity Date', field: 'MaturityDate', editable: true, minWidth: 130 },
    { headerName: 'Platform', field: 'Platform', editable: true, minWidth: 120 },
    { headerName: 'Account', field: 'Account', editable: true, minWidth: 120 },
    { headerName: 'BankAccount', headerTooltip: 'BankAccount', field: 'BankAccount', editable: true, minWidth: 140 },
    { headerName: 'Purchase Type', field: 'BondPurchaseType', editable: true, minWidth: 140,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['Primary','Secondary'] }
    },
    { headerName: 'Status', field: 'Status', editable: true, minWidth: 120,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['Active','Closed'] }
    },
    { headerName: 'Settlement Date', field: 'Settlement Date', editable: true, minWidth: 140 },
    { headerName: 'ISIN', field: 'ISIN', editable: true, minWidth: 140 },
    { headerName: 'Closed?', field: 'Closed?', editable: true, minWidth: 110,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['Yes','No'] }
    },
    { headerName: 'Comment', field: 'Comment', editable: true, minWidth: 200 },
  ]

  const monthCols = months.map(label => ({
    headerName: label,
    field: label,
    editable: (params) => {
      const mat = parseISODateOnly(params.data?.['MaturityDate'])
      if (!mat) return true
      const md = parseMonthLabel(label)
      return md <= mat
    },
    cellClass: (params) => maturityClassesForCell(params.data, label),
    valueParser: (params) => {
      const num = Number(params.newValue)
      return isNaN(num) ? 0 : num
    },
    width: 110,
  }))

  const accumulated = [{
    headerName: 'Accumulated Amount',
    field: 'Accumulated_Amount',
    valueGetter: (p) => calcAccumulatedForRow(p.data),
    pinned: 'right',
    minWidth: 160
  }]

  return [...master, ...monthCols, ...accumulated]
}
