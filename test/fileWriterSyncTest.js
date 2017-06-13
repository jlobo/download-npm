import test from 'tape'
import td from 'testdouble'
import FileWriterSync from '../src/packages/fsEs6/fileWriterSync'

test('FileWriterSync.seek() should change the position', async assert => {
  const writer = td.object(['seek'])
  const fw = new FileWriterSync(writer)

  await fw.seek(20)

  assert.doesNotThrow(() => td.verify(writer.seek(20)))
  assert.end()
})

test('FileWriterSync.write() should apply the content', {timeout: 1100}, async assert => {
  const data = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  const writer = td.object(['write'])

  td.when(writer.write(td.matchers.anything())).thenDo(content => {
    assert.deepEqual(data.shift(), content)
    setTimeout(writer.onwriteend, 100)
  })

  const fw = new FileWriterSync(writer)
  data.forEach(value => fw.write(value))

  await fw.stack
  assert.end()
})

test('FileWriterSync.truncate() should remove the length', {timeout: 1100}, async assert => {
  const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const writer = td.object(['truncate'])

  td.when(writer.truncate(td.matchers.anything())).thenDo(length => {
    assert.deepEqual(data.shift(), length)
    setTimeout(writer.onwriteend, 100)
  })

  const fw = new FileWriterSync(writer)
  data.forEach(value => fw.truncate(value))

  await fw.stack
  assert.end()
})
