import path from 'path'
import Stream from 'stream'
import tar from 'tar-stream'
import fs from 'fs'

export default class TarEs6 extends Stream.Writable {
  constructor(directory = '/', options) {
    super(options)

    this.fs = fs
    this.directory = directory
    this.tarStream = tar.extract()
    this.tarStream.on('entry', this._onEntry.bind(this))
    this._directories = new Set()
    this._validate()
  }

  map(header) { return header }

  mapStream(stream) { return stream }

  ignore() { return false }

  get sep() { return '/' }

  async _validate() {
    await this.fs.existsSync(this.directory)
  }

  _write(chunk, enc, next) {
    this.tarStream.write(chunk, enc, next)
  }

  async _onEntry(header, stream, callback) {
    if (!['file', 'directory'].includes(header.type) || this.ignore(header.name, header))
      return callback()

    header = this.map(header)
    stream = this.mapStream(stream)

    const isFile = header.type === 'file'
    await this._createDirectories(header.name, isFile)
    if (!isFile)
      return callback()

    stream.pipe(this.fs.createWriteStream(header.name)).on('finish', callback)
  }

  _createDirectories(entry, isFile) {
    const ok = Promise.resolve()
    const directory = isFile ? path.dirname(entry) : entry
    if (this._directories.has(directory))
      return ok

    const newDirs = directory.split(this.sep)
      .map((dir, i, dirs) => path.join(...dirs.slice(0, i + 1)))
      .filter(dir => !this._directories.has(dir))

    newDirs.forEach(dir => this._directories.add(dir))
    return newDirs.reduce((promise, dir) =>
      promise.then(() => this.fs.mkdirSync(path.join(this.directory, dir))), ok)
      .catch(()=> ok)
  }
}
