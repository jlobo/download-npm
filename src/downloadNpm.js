import zlib from 'zlib'
import TarEs6 from './packages/tarEs6'
import PackageStream from './packageStream'
const singleton = Symbol()

export default class DownloadNpm {
  constructor() {
    this._tar = null
    this._unzip = zlib.createUnzip()
    this._unzip.on('error', this._onErrorUnzip.bind(this))
  }

  static get instance() {
    if (!this[singleton])
      this[singleton] = new DownloadNpm()

    return this[singleton]
  }

  download(name, path = '/') {
    const stream = new PackageStream(name)

    this._tar = new TarEs6(path)
    this._tar.map = this._mapTar.bind(this, name)

    stream.pipe(this._unzip).pipe(this._tar)
    return new Promise((resolve, reject) => {
      this._tar.on('error', reject)
      this._tar.on('finish', ()=> resolve())
    })
  }

  _mapTar(name, header) {
    header.name = header.name.replace(/^\/?package\//, `${name}/`)
    return header
  }

  _onErrorUnzip(err) {
    if (err.code !== 'Z_BUF_ERROR')
      return this._tar.emit('error', err)

    console.error('Buffer Error :(')
    this._tar.end()
  }
}
