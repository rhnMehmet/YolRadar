import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { demoReports } from '../apps/admin/src/data/reports.ts'
import { getDamageTypeLabel, getReportStatusLabel, formatReportDate } from '@roadsense/shared'

const source = await readFile(new URL('../.migration-backups/task5-20261021/original/apps/admin/src/data/reports.ts', import.meta.url), 'utf8')
const before = [...source.matchAll(/\{ id: '([^']+)', damageType: '([^']+)', location: '([^']+)', date: '([^']+)', status: '([^']+)' \}/g)]
  .map(([, id, damageType, location, date, status]) => ({ id, damageType, location, date, status }))
const after = demoReports.map((report) => ({
  id: report.id,
  damageType: getDamageTypeLabel(report.damageType),
  location: report.location,
  date: report.date,
  status: getReportStatusLabel(report.status),
}))
assert.equal(before.length, 8)
assert.deepEqual(after, before)
assert.equal(demoReports.some((report) => 'coordinates' in report), false)
console.log(JSON.stringify({
  records: after.length,
  distribution: Object.fromEntries(['new', 'in_review', 'resolved'].map((status) =>
    [status, demoReports.filter((report) => report.status === status).length])),
  dates: demoReports.map((report) => formatReportDate(report.date)),
  allDisplayFieldsUnchanged: true,
  inventedCoordinates: false,
}, null, 2))
