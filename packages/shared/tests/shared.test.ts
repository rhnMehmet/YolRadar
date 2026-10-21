import assert from 'node:assert/strict'
import test from 'node:test'
import {
  APP_NAME, DAMAGE_TYPES, REPORT_STATUSES, getDamageTypeLabel,
  getReportStatusLabel, isValidCoordinates, formatReportDate,
  createApiClientConfig, DEFAULT_API_TIMEOUT_MS,
} from '../src/index.ts'
import type {
  UserRole, DamageType, ReportStatus, Coordinates, DamageReport,
  ReportPhoto, AiPrediction, ApiError, ApiClient, ApiResult,
} from '../src/index.ts'

test('all public domain types are available to consumers', () => {
  const role: UserRole = 'citizen'
  const type: DamageType = 'pothole'
  const status: ReportStatus = 'new'
  const coordinates: Coordinates = { latitude: 0, longitude: 0 }
  const photo: ReportPhoto = { id: 'sample-photo', uri: 'file:///sample.jpg' }
  const prediction: AiPrediction = { damageType: type, confidence: 0.8 }
  const report: DamageReport = {
    id: 'sample', damageType: type, coordinates, description: 'Test', status,
    createdAt: '2026-10-21T00:00:00Z', photos: [photo], aiPredictions: [prediction],
  }
  const error: ApiError = { kind: 'timeout', code: 'TIMEOUT', message: 'Test' }
  const result: ApiResult<DamageReport> = { ok: true, data: report }
  const client: ApiClient = { async request<T>(): Promise<ApiResult<T>> { return { ok: false, error } } }
  assert.equal(role, 'citizen')
  assert.equal(result.data.id, 'sample')
  assert.equal(typeof client.request, 'function')
  assert.equal(APP_NAME, 'RoadSense')
})

test('every damage and status code has the requested Turkish label', () => {
  assert.deepEqual(DAMAGE_TYPES.map(getDamageTypeLabel), ['Çukur', 'Boyuna çatlak', 'Enine çatlak', 'Timsah sırtı çatlak', 'Diğer'])
  assert.deepEqual(REPORT_STATUSES.map(getReportStatusLabel), ['Yeni', 'İnceleniyor', 'Çözüldü'])
})

test('coordinates accept world boundaries, zero and non-Isparta locations', () => {
  for (const coordinates of [
    { latitude: -90, longitude: -180 }, { latitude: 90, longitude: 180 },
    { latitude: 0, longitude: 0 }, { latitude: 51.5, longitude: -0.12 },
  ]) assert.equal(isValidCoordinates(coordinates), true)
})

test('coordinates reject out-of-range, non-finite, missing and non-number inputs', () => {
  for (const value of [
    null, undefined, [], '0,0', {}, { latitude: 0 },
    { latitude: 90.001, longitude: 0 }, { latitude: -90.001, longitude: 0 },
    { latitude: 0, longitude: 180.001 }, { latitude: 0, longitude: -180.001 },
    { latitude: NaN, longitude: 0 }, { latitude: 0, longitude: Infinity },
    { latitude: '0', longitude: 0 },
  ]) assert.equal(isValidCoordinates(value), false)
})

test('date-only and UTC input use deterministic Turkish UTC dates', () => {
  assert.equal(formatReportDate('2026-10-21'), '21 Eki 2026')
  assert.equal(formatReportDate('2026-10-21T00:00:00Z'), '21 Eki 2026')
  assert.equal(formatReportDate('2026-10-21T23:59:59.999Z'), '21 Eki 2026')
  assert.equal(formatReportDate('2024-02-29'), '29 Şub 2024')
  assert.equal(formatReportDate('0099-01-01'), '1 Oca 99')
})

test('dates reject invalid calendar values and ambiguous/local inputs', () => {
  for (const value of [
    '', '21/10/2026', '2026-02-29', '2026-04-31', '2026-00-01', '2026-13-01',
    '0000-01-01', '2026-10-21T24:00:00Z', '2026-10-21T00:60:00Z',
    '2026-10-21T00:00:60Z', '2026-10-21T12:00:00', '2026-10-21T12:00:00+03:00',
  ]) assert.throws(() => formatReportDate(value), RangeError)
})

test('API configuration is immutable and does not fetch a token', () => {
  let calls = 0
  const tokenProvider = () => { calls += 1; return 'test-token' }
  const config = createApiClientConfig({ baseUrl: 'https://example.invalid/api/', tokenProvider })
  assert.equal(config.baseUrl, 'https://example.invalid/api')
  assert.equal(config.timeoutMs, DEFAULT_API_TIMEOUT_MS)
  assert.equal(calls, 0)
  assert.equal(Object.isFrozen(config), true)
  assert.equal(createApiClientConfig({ baseUrl: 'http://localhost:8000', timeoutMs: 2500 }).timeoutMs, 2500)
})

test('API configuration rejects invalid transport settings', () => {
  for (const baseUrl of ['not-a-url', 'file:///test', 'https://user:password@example.invalid', 'https://example.invalid?q=a', 'https://example.invalid#token']) {
    assert.throws(() => createApiClientConfig({ baseUrl }))
  }
  for (const timeoutMs of [0, -1, 0.5, Infinity, NaN]) {
    assert.throws(() => createApiClientConfig({ baseUrl: 'https://example.invalid', timeoutMs }), RangeError)
  }
})
