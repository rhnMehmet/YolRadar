import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const backup = path.join(root, '.migration-backups/task5-20261021')
const readJson = async (file) => JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''))
const writeJson = (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`)
const workspaces = ['apps/mobile', 'apps/admin', 'packages/shared']

async function originals() {
  return Promise.all(workspaces.slice(0, 2).map(async (workspace) => ({
    workspace,
    lock: await readJson(path.join(backup, 'original', workspace, 'package-lock.json')),
  })))
}

async function compare() {
  const current = await readJson(path.join(root, 'package-lock.json'))
  const differences = []
  let compared = 0
  for (const { workspace, lock } of await originals()) {
    for (const [location, descriptor] of Object.entries(lock.packages)) {
      if (!location) continue
      compared += 1
      const target = `${workspace}/${location}`
      const actual = current.packages[target]
      const fields = ['version', 'resolved', 'integrity']
      if (!actual) differences.push({ path: target, kind: 'missing' })
      else for (const field of fields) {
        if (descriptor[field] !== actual[field]) {
          differences.push({ path: target, field, before: descriptor[field], after: actual[field] })
        }
      }
    }
  }
  const oldPaths = new Set((await originals()).flatMap(({ workspace, lock }) =>
    Object.keys(lock.packages).filter(Boolean).map((location) => `${workspace}/${location}`)))
  const additions = Object.entries(current.packages)
    .filter(([location]) => location && !oldPaths.has(location))
    .map(([location, descriptor]) => ({ path: location, version: descriptor.version, link: descriptor.link }))
  const allowed = new Set([...workspaces, 'node_modules/mobile', 'node_modules/admin', 'node_modules/@roadsense/shared', 'node_modules/typescript'])
  for (const addition of additions) {
    if (!allowed.has(addition.path)) differences.push({ kind: 'unexpected-addition', ...addition })
    if (addition.path === 'node_modules/typescript' && addition.version !== '6.0.3') {
      differences.push({ kind: 'unexpected-tool-version', ...addition })
    }
  }
  const report = { compared, differences, additions }
  await writeJson(path.join(backup, 'dependency-comparison.json'), report)
  console.log(JSON.stringify(report, null, 2))
  if (differences.length) throw new Error('Dependency resolution changed: do not install without approval.')
}

const action = process.argv[2]
if (action === 'seed') {
  const manifest = await readJson(path.join(root, 'package.json'))
  const packages = { '': {
    name: manifest.name, version: manifest.version, workspaces: manifest.workspaces,
    devDependencies: manifest.devDependencies, engines: manifest.engines,
  } }
  for (const workspace of workspaces) {
    const pkg = await readJson(path.join(root, workspace, 'package.json'))
    packages[workspace] = {
      name: pkg.name, version: pkg.version,
      ...(pkg.dependencies ? { dependencies: pkg.dependencies } : {}),
      ...(pkg.devDependencies ? { devDependencies: pkg.devDependencies } : {}),
    }
    packages[`node_modules/${pkg.name}`] = { resolved: workspace, link: true }
  }
  const baseline = await originals()
  for (const { workspace, lock } of baseline) {
    for (const [location, descriptor] of Object.entries(lock.packages)) {
      if (location) packages[`${workspace}/${location}`] = descriptor
    }
  }
  packages['node_modules/typescript'] = baseline[0].lock.packages['node_modules/typescript']
  await writeJson(path.join(root, 'package-lock.json'), {
    name: manifest.name, version: manifest.version, lockfileVersion: 3, requires: true, packages,
  })
  console.log('Root lock candidate seeded from preserved v3 locks; no dependencies installed.')
  await compare()
} else if (action === 'verify') {
  await compare()
} else if (action === 'installed') {
  await compare()
  const lock = await readJson(path.join(root, 'package-lock.json'))
  const differences = []
  let checked = 0
  let platformOptionalAbsent = 0
  for (const [location, descriptor] of Object.entries(lock.packages)) {
    if (!location.includes('node_modules/') || descriptor.link) continue
    let actual
    try { actual = await readJson(path.join(root, location, 'package.json')) } catch (error) {
      const allowedOs = !descriptor.os || descriptor.os.includes(process.platform)
      const allowedCpu = !descriptor.cpu || descriptor.cpu.includes(process.arch)
      if (error.code === 'ENOENT' && descriptor.optional && (!allowedOs || !allowedCpu)) {
        platformOptionalAbsent += 1
        continue
      }
      differences.push({ path: location, kind: 'missing-installed-package' })
      continue
    }
    checked += 1
    if (actual.version !== descriptor.version) differences.push({ path: location, expected: descriptor.version, actual: actual.version })
  }
  const report = { checked, platformOptionalAbsent, differences }
  await writeJson(path.join(backup, 'installed-comparison.json'), report)
  console.log(JSON.stringify(report, null, 2))
  if (differences.length) throw new Error('Installed tree differs from reviewed lock.')
} else if (action === 'snapshot') {
  const lock = await readFile(path.join(root, 'package-lock.json'))
  await writeFile(path.join(backup, 'root-lock-reviewed.json'), lock)
  console.log(createHash('sha256').update(lock).digest('hex'))
} else {
  throw new Error('Expected seed, verify, installed or snapshot.')
}
