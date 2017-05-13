const td = require('testdouble')
const test = require('tape')
const Stream = require('stream')
const PackageInfo = td.replace('../src/packageInfo').default
const PackageStream = require('../src/packageStream').default
td.reset()

test('PackageStream should configure the pipe', assert => {
  const fake = new Stream.Transform()
  td.when(PackageInfo.prototype.getStream()).thenReturn(Promise.resolve(fake))

  const stream = new PackageStream('name')

  stream.on('pipe', data => {
    assert.strictEqual(data, fake)
    assert.end()
  })
})

test('PackageStream should throw an error', assert => {
  const err = {}
  td.when(PackageInfo.prototype.getStream()).thenReturn(Promise.reject(err))

  const stream = new PackageStream('name')

  stream.on('error', data => {
    assert.strictEqual(data, err)
    assert.end()
  })
})

test('PackageStream should pass the data through the pipe', assert => {
  td.when(PackageInfo.prototype.getStream())
    .thenReturn(Promise.resolve(new Stream.Transform()))

  const stream = new PackageStream('name')

  td.replace(stream, 'push')
  const next = td.function()

  stream._transform(1, 2, next)

  td.verify(next())
  td.verify(stream.push(1, 2))

  assert.end()
})
