import type { Coordinates, DamageType, ReportStatus } from './types.ts'

const damageLabels: Record<DamageType, string> = {
  pothole: 'Çukur',
  longitudinal_crack: 'Boyuna çatlak',
  transverse_crack: 'Enine çatlak',
  alligator_crack: 'Timsah sırtı çatlak',
  other: 'Diğer',
}

const statusLabels: Record<ReportStatus, string> = {
  new: 'Yeni',
  in_review: 'İnceleniyor',
  resolved: 'Çözüldü',
}

export function getDamageTypeLabel(type: DamageType): string {
  return damageLabels[type]
}

export function getReportStatusLabel(status: ReportStatus): string {
  return statusLabels[status]
}

export function isValidCoordinates(value: unknown): value is Coordinates {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Partial<Coordinates>
  return typeof candidate.latitude === 'number'
    && Number.isFinite(candidate.latitude)
    && candidate.latitude >= -90 && candidate.latitude <= 90
    && typeof candidate.longitude === 'number'
    && Number.isFinite(candidate.longitude)
    && candidate.longitude >= -180 && candidate.longitude <= 180
}

const shortMonths = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'] as const

/**
 * Accepts YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss[.sss]Z.
 * Always formats the UTC calendar date; never guesses a local timezone/locale.
 * Invalid input throws RangeError rather than silently normalizing it.
 */
export function formatReportDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z)?$/.exec(value)
  if (!match) throw new RangeError('Tarih YYYY-MM-DD veya açık UTC zaman damgası olmalı.')
  const [, yearText, monthText, dayText, hourText = '0', minuteText = '0', secondText = '0', fraction = '0'] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const second = Number(secondText)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, Number(fraction.padEnd(3, '0')))
  if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day || date.getUTCHours() !== hour
    || date.getUTCMinutes() !== minute || date.getUTCSeconds() !== second) {
    throw new RangeError('Geçersiz takvim tarihi veya saat.')
  }
  return `${day} ${shortMonths[month - 1]} ${year}`
}
