import got from 'got'
import semver from 'semver'
import querystring from 'querystring'
import validate from 'validate-npm-package-name'

const exp = /^((@[^@\/]+)\/)?([^@\/]+)(@([^@\/]+))?$/

// Rename for PackageInfo
export default class InfoPackage {
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
    return `https://registry.npmjs.org/${querystring.escape(this.name)}`.toLowerCase()
  }

  async getInfo() {
    if (this._info)
      return this._info

    // verify if the response is ok, if the package exits
    const res = await got(this.urlPackage, {json: true})
    const version = this.version ? this.version : res.body['dist-tags'][this.tag]
    this._info = res.body.versions[version]

    return this._info || Promise.reject('package version does not exist')
  }

  async getStream() {
    const info = await this.getInfo()
    return got.stream(info.dist.tarball)
  }
}
