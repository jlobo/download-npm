import test from 'tape'
import InfoPackage from '../src/infoPackage'

const info = new InfoPackage()

test('InfoPackage.get() should validate the package name', assert => {
  assert.deepEqual(info.get().valid, false)
  assert.deepEqual(info.get(':weirdchars').valid, false)
  assert.deepEqual(info.get(' space').valid, false)
  assert.deepEqual(info.get('@npm').valid, false)
  assert.deepEqual(info.get('@1.1.0').valid, false)
  assert.end()
})

test('InfoPackage.get() should obtain name', assert => {
  const data = info.get('package-name')
  assert.deepEqual(data.valid, true)
  assert.deepEqual(data.name, 'package-name')
  assert.deepEqual(data.escapedName, 'package-name')
  assert.deepEqual(data.scope, null)
  assert.deepEqual(data.version, 'latest')
  assert.end()
})

test('InfoPackage.get() should obtain name and scope', assert => {
  const data = info.get('@npm/package-name')
  assert.deepEqual(data.valid, true)
  assert.deepEqual(data.name, '@npm/package-name')
  assert.deepEqual(data.escapedName, '%40npm%2Fpackage-name')
  assert.deepEqual(data.scope, '@npm')
  assert.deepEqual(data.version, 'latest')
  assert.end()
})

test('InfoPackage.get() should obtain name, scope and tag', assert => {
  const data = info.get('@npm/package-name@current')
  assert.deepEqual(data.valid, true)
  assert.deepEqual(data.name, '@npm/package-name')
  assert.deepEqual(data.escapedName, '%40npm%2Fpackage-name')
  assert.deepEqual(data.scope, '@npm')
  assert.deepEqual(data.version, 'current')
  assert.end()
})

test('InfoPackage.get() should obtain name, scope and version', assert => {
  const data = info.get('@npm/package-name@0.0.1')
  assert.deepEqual(data.valid, true)
  assert.deepEqual(data.name, '@npm/package-name')
  assert.deepEqual(data.escapedName, '%40npm%2Fpackage-name')
  assert.deepEqual(data.scope, '@npm')
  assert.deepEqual(data.version, '0.0.1')
  assert.end()
})

test('InfoPackage.get() should obtain name and tag', assert => {
  const data = info.get('package-name@latest')
  assert.deepEqual(data.valid, true)
  assert.deepEqual(data.name, 'package-name')
  assert.deepEqual(data.escapedName, 'package-name')
  assert.deepEqual(data.scope, null)
  assert.deepEqual(data.version, 'latest')
  assert.end()
})

test('InfoPackage.get() should obtain name and version', assert => {
  const data = info.get('package-name@0.0.1')
  assert.deepEqual(data.valid, true)
  assert.deepEqual(data.name, 'package-name')
  assert.deepEqual(data.escapedName, 'package-name')
  assert.deepEqual(data.scope, null)
  assert.deepEqual(data.version, '0.0.1')
  assert.end()
})
