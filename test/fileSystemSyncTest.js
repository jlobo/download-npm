const td = require('testdouble')
const test = require('tape')
const win = require('../src/global/window').default
const FileWriterSync = require('../src/fileWriterSync').default
const FileReader = td.replace('../src/global/fileReader').default
const FileSystemSync = require('../src/fileSystemSync').default

const any = td.matchers.anything()

test('FileSystemSync.root() should get the principal directory', async assert => {
  const root = {}

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => {
      assert.deepEqual(type, win.TEMPORARY)
      assert.equal(size, Math.pow(1024, 3))
      done({root})
    })

  const fs = new FileSystemSync()
  const value = await fs.root

  td.reset()
  assert.deepEqual(value, root)
  assert.end()
})

test('FileSystemSync.root() should trigger an error', async assert => {
  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done, reject) => reject())

  const fs = new FileSystemSync()
  await fs.root.then(assert.fail, assert.pass)

  td.reset()
  assert.end()
})

test('FileSystemSync.getDirectoryEntry() should obtain the directory', async assert => {
  const create = false
  const directory = {}

  const root = td.object(['getDirectory'])
  td.when(root.getDirectory(any, any, any, any))
    .thenDo((path, config, done) => {
      assert.deepEqual(path, '/home')
      assert.equal(config.create, create)
      assert.true(config.exclusive)
      done(directory)
    })

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const fs = new FileSystemSync()
  const value = await fs.getDirectoryEntry('/home', {create})

  td.reset()
  assert.deepEqual(value, directory)
  assert.end()
})

test('FileSystemSync.getDirectoryEntry() should trigger an error', async assert => {
  const root = td.object(['getDirectory'])
  td.when(root.getDirectory(any, any, any, any))
    .thenDo((path, config, done, reject) => reject())

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const fs = new FileSystemSync()
  await fs.getDirectoryEntry('/home').then(assert.fail, assert.pass)

  td.reset()
  assert.end()
})

test('FileSystemSync.getFileEntry() should obtain the file', async assert => {
  const file = {}
  const configEntry = {}

  const root = td.object(['getFile'])
  td.when(root.getFile(any, any, any, any))
    .thenDo((path, config, done) => {
      assert.deepEqual(path, '/home')
      assert.deepEqual(config, configEntry)
      done(file)
    })

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const fs = new FileSystemSync()
  const value = await fs.getFileEntry('/home', configEntry)

  td.reset()
  assert.deepEqual(value, file)
  assert.end()
})

test('FileSystemSync.getFileEntry() should trigger an error', async assert => {
  const root = td.object(['getFile'])
  td.when(root.getFile(any, any, any, any))
    .thenDo((path, config, done, reject) => reject())

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const fs = new FileSystemSync()
  await fs.getFileEntry('/home').then(assert.fail, assert.pass)

  td.reset()
  assert.end()
})

test('FileSystemSync.getFileWriter() should obtain the writer', async assert => {
  const writer = {}
  const file = td.object(['createWriter'])
  td.when(file.createWriter(any, any))
    .thenDo(done => done(writer))

  const root = td.object(['getFile'])
  td.when(root.getFile(any, any, any, any))
    .thenDo((path, config, done) => {
      assert.true(config.create)
      assert.false(config.exclusive)
      done(file)
    })

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const fs = new FileSystemSync()
  const value = await fs.getFileWriter('/home')

  td.reset()
  assert.true(value instanceof FileWriterSync)
  assert.equal(value.writer, writer)
  assert.deepEqual(value.path, '/home')
  assert.end()
})

test('FileSystemSync.getFileWriter() should trigger an error', async assert => {
  const file = td.object(['createWriter'])
  td.when(file.createWriter(any, any))
    .thenDo((done, reject) => reject())

  const root = td.object(['getFile'])
  td.when(root.getFile(any, any, any, any))
    .thenDo((path, config, done) => done(file))

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const fs = new FileSystemSync()
  await fs.getFileWriter('/home').then(assert.fail, assert.pass)

  td.reset()
  assert.end()
})

test('FileSystemSync.getFileReader() should obtain the reader', async assert => {
  const file = td.object(['file'])
  td.when(file.file(any, any)).thenDo(done => done('data'))

  const root = td.object(['getFile'])
  td.when(root.getFile(any, any, any, any))
    .thenDo((path, config, done) => {
      assert.deepEqual(path, '/home')
      assert.false(config.create)
      assert.deepEqual(typeof config.exclusive, 'undefined')
      done(file)
    })

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const rader = td.object(['readAsText'])
  td.when(rader.readAsText(any))
    .thenDo(data => {
      assert.deepEqual(data, 'data')
      rader.onloadend()
    })

  td.when(FileReader()).thenReturn(rader)

  const fs = new FileSystemSync()
  const value = await fs.getFileReader('/home')

  td.reset()
  assert.equal(value, rader)
  assert.end()
})

test('FileSystemSync.getFileReader() should trigger an error', async assert => {
  const file = td.object(['file'])
  td.when(file.file(any, any))
    .thenDo((done, reject) => reject())

  const root = td.object(['getFile'])
  td.when(root.getFile(any, any, any, any))
    .thenDo((path, config, done) => done(file))

  td.replace(win, 'requestFileSystem')
  td.when(win.requestFileSystem(any, any, any, any))
    .thenDo((type, size, done) => done({root}))

  const fs = new FileSystemSync()
  await fs.getFileReader('/home').then(assert.fail, assert.pass)

  td.reset()
  assert.end()
})
