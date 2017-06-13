const td = require('testdouble')
const test = require('tape')
const Stream = require('stream')
const zlib = td.replace('zlib')
const TarEs6 = td.replace('../src/packages/tarEs6', td.constructor(Stream.Writable))
const packageStream = td.replace('../src/packageStream', td.constructor(Stream.Transform))
const DownloadNpm = require('../src/downloadNpm').default
const any = td.matchers.anything()
const isA = td.matchers.isA
td.reset()

test('DownloadNpm.constructor() should configure the object', assert => {
  const Unzip = td.constructor(Stream.Transform)
  const unzip = new Unzip()

  td.when(zlib.createUnzip()).thenReturn(unzip)

  const npm = new DownloadNpm()

  td.verify(Unzip.prototype.on('error', isA(Function)))
  assert.strictEqual(npm._tar, null)
  assert.strictEqual(npm._unzip, unzip)
  assert.end()
})

test('DownloadNpm.download() should obtain the package', {timeout: 100}, async assert => {
  const Unzip = td.constructor(Stream.Transform)
  const zip = new Unzip()
  td.when(zlib.createUnzip()).thenReturn(zip)

  td.when(packageStream.prototype.pipe(any)).thenDo(obj => obj)
  td.when(Unzip.prototype.pipe(any)).thenDo(obj => obj)
  td.when(TarEs6.prototype.on('finish')).thenCallback()

  const npm = new DownloadNpm()
  await npm.download('name', '/tmp')

  td.verify(TarEs6.prototype.on('error', isA(Function)))
  td.verify(new TarEs6.prototype.constructor('/tmp'))
  td.verify(new packageStream.prototype.constructor('name'))
  assert.true(npm._tar instanceof TarEs6)
  assert.true(npm._tar.map instanceof Function)
  assert.end()
})

test('DownloadNpm._mapTar() should rename the header name', assert => {
  const header = DownloadNpm.prototype._mapTar('npm', {name: 'package/'})

  assert.deepEqual(header.name, 'npm/')
  assert.end()
})

test('DownloadNpm._onErrorUnzip() should verify the type of error', assert => {
  const npm = {_tar: new TarEs6()}

  DownloadNpm.prototype._onErrorUnzip.call(npm, {})
  td.verify(TarEs6.prototype.emit('error', {}))

  DownloadNpm.prototype._onErrorUnzip.call(npm, {code: 'Z_BUF_ERROR'})
  td.verify(TarEs6.prototype.end())

  assert.end()
})
