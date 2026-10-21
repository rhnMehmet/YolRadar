// Provisional domain contract. Confirm field names with the future backend.
export const DAMAGE_TYPES = [
  'pothole',
  'longitudinal_crack',
  'transverse_crack',
  'alligator_crack',
  'other',
] as const

export const REPORT_STATUSES = ['new', 'in_review', 'resolved'] as const
export const APP_NAME = 'RoadSense'

export type UserRole = 'citizen' | 'municipal_staff' | 'admin'
export type DamageType = (typeof DAMAGE_TYPES)[number]
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface ReportPhoto {
  id: string
  uri: string
}

export interface AiPrediction {
  damageType: DamageType
  /** Confidence in the inclusive range 0..1. */
  confidence: number
}

export interface DamageReport {
  id: string
  damageType: DamageType
  coordinates: Coordinates
  description: string
  status: ReportStatus
  /** ISO 8601 timestamp with an explicit UTC suffix (Z). */
  createdAt: string
  lane?: string
  photos: readonly ReportPhoto[]
  aiPredictions?: readonly AiPrediction[]
}

export interface ApiError {
  kind: 'http' | 'network' | 'timeout' | 'aborted' | 'invalid_response'
  code: string
  message: string
  status?: number
}
