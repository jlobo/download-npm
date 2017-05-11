const test = require('tape')
const td = require('testdouble')
const got = td.replace('got')
const PackageInfo = require('../src/packageInfo').default
const any = td.matchers.anything()

test('InfoPackage.get() should validate the package name', assert => {
  assert.deepEqual((new PackageInfo()).isValid, false)
  assert.deepEqual((new PackageInfo(':weirdchars')).isValid, false)
  assert.deepEqual((new PackageInfo(' space')).isValid, false)
  assert.deepEqual((new PackageInfo('@npm')).isValid, false)
  assert.deepEqual((new PackageInfo('@1.1.0')).isValid, false)
  assert.end()
})

test('InfoPackage.get() should obtain name', assert => {
  const info = new PackageInfo('package-name')
  assert.deepEqual(info.isValid, true)
  assert.deepEqual(info.name, 'package-name')
  assert.deepEqual(info.scope, null)
  assert.deepEqual(info.tag, 'latest')
  assert.deepEqual(info.version, null)
  assert.end()
})

test('InfoPackage.get() should obtain name and scope', assert => {
  const info = new PackageInfo('@npm/package-name')
  assert.deepEqual(info.isValid, true)
  assert.deepEqual(info.name, '@npm/package-name')
  assert.deepEqual(info.scope, '@npm')
  assert.deepEqual(info.tag, 'latest')
  assert.deepEqual(info.version, null)
  assert.end()
})

test('InfoPackage.get() should obtain name, scope and tag', assert => {
  const info = new PackageInfo('@npm/package-name@current')
  assert.deepEqual(info.isValid, true)
  assert.deepEqual(info.name, '@npm/package-name')
  assert.deepEqual(info.scope, '@npm')
  assert.deepEqual(info.tag, 'current')
  assert.deepEqual(info.version, null)
  assert.end()
})

test('InfoPackage.get() should obtain name, scope and version', assert => {
  const info = new PackageInfo('@npm/package-name@0.0.1')
  assert.deepEqual(info.isValid, true)
  assert.deepEqual(info.name, '@npm/package-name')
  assert.deepEqual(info.scope, '@npm')
  assert.deepEqual(info.tag, null)
  assert.deepEqual(info.version, '0.0.1')
  assert.end()
})

test('InfoPackage.get() should obtain name and tag', assert => {
  const info = new PackageInfo('package-name@latest')
  assert.deepEqual(info.isValid, true)
  assert.deepEqual(info.name, 'package-name')
  assert.deepEqual(info.scope, null)
  assert.deepEqual(info.tag, 'latest')
  assert.deepEqual(info.version, null)
  assert.end()
})

test('InfoPackage.get() should obtain name and version', assert => {
  const info = new PackageInfo('package-name@0.0.1')
  assert.deepEqual(info.isValid, true)
  assert.deepEqual(info.name, 'package-name')
  assert.deepEqual(info.scope, null)
  assert.deepEqual(info.tag, null)
  assert.deepEqual(info.version, '0.0.1')
  assert.end()
})

test('InfoPackage.urlPackage() should obtain the url', assert => {
  const info = new PackageInfo('@npm/package-name')

  assert.deepEqual(info.urlPackage, 'https://registry.npmjs.org/%40npm%2fpackage-name')
  assert.end()
})

test('InfoPackage.getInfo() should obtain the json from the registry', async assert => {
  const res = { body: {
    'dist-tags': { main: '1.1.0' },
    versions: {
      '1.0.0': { dist: { tarball: 'https://npmjs.org' } },
      '1.1.0': { dist: { tarball: 'https://npmjs.org' } },
    },
  } }

  td.when(got(any, any)).thenReturn(Promise.resolve(res))

  let info = new PackageInfo('package-name@main')
  let value = await info.getInfo()
  assert.strictEqual(value, res.body.versions['1.1.0'], 'package version exist')

  info = new PackageInfo('package-name@1.0.0')
  value = await info.getInfo()
  assert.strictEqual(value, res.body.versions['1.0.0'], 'package version exist')

  info = new PackageInfo('package-name@2.0.0')
  await info.getInfo().then(assert.fail, assert.pass)

  info = new PackageInfo('package-name')
  await info.getInfo().then(assert.fail, assert.pass)

  td.reset()
  assert.end()
})

test('InfoPackage.getStream() should obtain the package stream from the registry', async assert => {
  const info = new PackageInfo('package-name')
  const stream = {}

  const res = { body: {
    'dist-tags': { latest: '1.0.0' },
    versions: { '1.0.0': { dist: { tarball: 'https://npmjs.org' } } },
  } }

  td.when(got(info.urlPackage, td.matchers.contains({json: true})))
    .thenReturn(Promise.resolve(res))

  td.when(got.stream(res.body.versions['1.0.0'].dist.tarball))
    .thenReturn(Promise.resolve(stream))

  const value = await info.getStream()

  td.reset()
  assert.strictEqual(value, stream)
  assert.end()
})
