export const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function monthLabel(year, monthIndex) {
  return `${MONTH_ABBR[monthIndex]}-${year}`
}
export function parseMonthLabel(label) {
  const [mon, yr] = label.split('-')
  const y = Number(yr)
  const m = MONTH_ABBR.indexOf(mon)
  return new Date(y, m, 1)
}
export function sameMonth(d1, d2) {
  return d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
}
export function parseISODateOnly(s) {
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
