export interface CsvColumn<T> {
  header: string
  accessor: (item: T) => string | number
}

function escapeCsvValue(value: string | number) {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv<T>(rows: Array<T>, columns: Array<CsvColumn<T>>): string {
  const header = columns.map((column) => escapeCsvValue(column.header))
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.accessor(row))),
  )
  return [header, ...lines].map((line) => line.join(',')).join('\n')
}

// 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙여서 내려받는다.
export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['﻿' + content], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
