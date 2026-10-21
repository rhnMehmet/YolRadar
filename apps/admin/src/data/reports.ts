import { DAMAGE_TYPES, REPORT_STATUSES } from '@roadsense/shared'
import type { DamageReport } from '@roadsense/shared'

export { formatReportDate } from '@roadsense/shared'
export type { ReportStatus, DamageType } from '@roadsense/shared'
export const reportStatuses = REPORT_STATUSES
// Keep the original four demo categories; the shared domain also supports other.
export const damageTypes = DAMAGE_TYPES.filter((type) => type !== 'other')

// A display model, not a complete backend record. No coordinates were collected.
export type Report = Pick<DamageReport, 'id' | 'damageType' | 'status'> & {
  location: string
  date: string
}

// These records are fictional. Neighborhood names do not indicate actual road damage.
export const demoReports: readonly Report[] = [
  { id: 'RS-0008', damageType: 'pothole', location: 'Çünür Mahallesi', date: '2026-10-21', status: 'new' },
  { id: 'RS-0007', damageType: 'longitudinal_crack', location: 'Fatih Mahallesi', date: '2026-10-21', status: 'in_review' },
  { id: 'RS-0006', damageType: 'alligator_crack', location: 'Bahçelievler Mahallesi', date: '2026-10-20', status: 'resolved' },
  { id: 'RS-0005', damageType: 'transverse_crack', location: 'Ayazmana Mahallesi', date: '2026-10-20', status: 'new' },
  { id: 'RS-0004', damageType: 'pothole', location: 'Fatih Mahallesi', date: '2026-10-19', status: 'in_review' },
  { id: 'RS-0003', damageType: 'longitudinal_crack', location: 'Çünür Mahallesi', date: '2026-10-19', status: 'resolved' },
  { id: 'RS-0002', damageType: 'alligator_crack', location: 'Ayazmana Mahallesi', date: '2026-10-18', status: 'new' },
  { id: 'RS-0001', damageType: 'pothole', location: 'Bahçelievler Mahallesi', date: '2026-10-18', status: 'resolved' },
]
