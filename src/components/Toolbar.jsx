import React, { useRef } from 'react'
import { exportToExcel, importFromExcel } from '../utils/excel.js'
import { generateEmptyRow } from '../utils/schema.js'

export default function Toolbar({ rowData, setRowData }) {
  const fileInputRef = useRef(null)

  return (
    <div style={{ display:'flex', gap:8, margin:'12px 0' }}>
      <button onClick={() => setRowData([...rowData, generateEmptyRow()])}>Add Bond</button>
      <button onClick={() => exportToExcel(rowData)}>Export to Excel</button>
      <button onClick={() => fileInputRef.current?.click()}>Import Excel</button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        style={{ display:'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const imported = await importFromExcel(file)
          if (imported && imported.length) setRowData(imported)
          e.target.value = ''
        }}
      />
      <button onClick={() => setRowData([])}>Clear All</button>
    </div>
  )
}
