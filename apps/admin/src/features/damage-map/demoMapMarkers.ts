import { isValidCoordinates } from '@roadsense/shared'
import type { Coordinates, DamageType, ReportStatus } from '@roadsense/shared'

export const ISPARTA_CENTER: Coordinates = { latitude: 37.7648, longitude: 30.5566 }
export const INITIAL_MAP_ZOOM = 14

export interface DemoMapMarker {
  id: string
  damageType: DamageType
  status: ReportStatus
  coordinates: Coordinates
}

// Representative UI test points only. Not linked to the eight demo reports.
export const demoMapMarkers: readonly DemoMapMarker[] = [
  { id: 'MAP-DEMO-001', damageType: 'pothole', status: 'new', coordinates: { latitude: 37.7664, longitude: 30.5538 } },
  { id: 'MAP-DEMO-002', damageType: 'longitudinal_crack', status: 'in_review', coordinates: { latitude: 37.7629, longitude: 30.5588 } },
  { id: 'MAP-DEMO-003', damageType: 'transverse_crack', status: 'resolved', coordinates: { latitude: 37.7653, longitude: 30.5610 } },
]

if (!isValidCoordinates(ISPARTA_CENTER) || demoMapMarkers.some((marker) => !isValidCoordinates(marker.coordinates))) {
  throw new RangeError('Demo harita koordinatları geçerli dünya aralıklarında olmalı.')
}
