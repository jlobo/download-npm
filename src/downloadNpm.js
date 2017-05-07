import TarEs6 from './tarEs6'
import got from 'got'
import zlib from 'zlib'

export default class DownloadNpm {
  constructor() {
    this.tar = null
    this.unzip = zlib.createUnzip()
    this.url = 'http://registry.npmjs.org/'

    this.unzip.on('error', this._onErrorUnzip.bind(this))
  }

  async download(name, path = '/') {
    let res = await got(this.url + name, {json: true})

    const latest = res.body['dist-tags'].latest
    const url = res.body.versions[latest].dist.tarball
    res = await got.stream(url)

    this.tar = new TarEs6(path)
    this.tar.map = this._mapTar.bind(this, name)
    res.pipe(this.unzip).pipe(this.tar)
  }

  _mapTar(name, header) {
    header.name = header.name.replace(/^\/?package\//, `${name}/`)
    return header
  }

  _onErrorUnzip(err) {
    if (err.code !== 'Z_BUF_ERROR')
      return this.tar.emit('error', err)

    this.tar.end()
  }
}
