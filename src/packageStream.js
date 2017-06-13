import Stream from 'stream'
import PackageInfo from './packages/packageInfo'

export default class PackageStream extends Stream.Transform {
  constructor(name, options) {
    super(options)

    this.info = new PackageInfo(name)
    this.info.getStream().then(stream => stream.pipe(this))
      .catch(err => this.emit('error', err))
  }

  _transform(chunk, enc, next) {
    this.push(chunk, enc)
    next()
  }
}
