import got from 'got'
import semver from 'semver'
import validate from 'validate-npm-package-name'
const exp = /^((@[^@\/]+)\/)?([^@\/]+)(@([^@\/]+))?$/

export default class PackageInfo {
  constructor(info) {
    const match = exp.exec(info)
    if (!info || !match) {
      this.isValid = false
      return this.isValid
    }

    this.scope = match[2] || null
    this.name = this.scope ? `${this.scope}/${match[3]}` : match[3]
    this.isValid = validate(this.name).validForOldPackages
    this.version = semver.valid(match[5], true)
    this.tag = !this.version ? match[5] || 'latest' : null
  }

  get urlPackage() {
    return `https://registry.npmjs.org/${encodeURIComponent(this.name)}`.toLowerCase()
  }

  async getInfo() {
    if (this._info)
      return this._info

    if (!this.isValid)
      return this.getError('Invalid package name')

    const res = await got(this.urlPackage, {json: true}).catch(this.getError)
    const version = this.version ? this.version : res.body['dist-tags'][this.tag]
    this._info = res.body.versions[version]

    return this._info || this.getError('The package version does not exist')
  }

  async getStream() {
    const info = await this.getInfo()
    return got.stream(info.dist.tarball)
  }

  getError(err) {
    if (typeof err === 'string')
      return Promise.reject({message: err})

    if (!err || !err.statusCode)
      return Promise.reject({message: 'Unexpected error'})

    switch (err.statusCode) {
      case 404: err.message = 'The package does not exist'; break
      default: err.message = 'Unexpected error'; break
    }

    return Promise.reject(err)
  }
}
