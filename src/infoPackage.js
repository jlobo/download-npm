import validate from 'validate-npm-package-name'
import querystring from 'querystring'

export default class InfoPackage {
  constructor() {
    this.exp = /^((@[^@\/]+)\/)?([^@\/]+)(@([^@\/]+))?$/
  }

  get(name) {
    const match = this.exp.exec(name)
    if (!name || !match)
      return { valid: false }

    const version = match[5]
    const scope = match[2]
    name = scope ? `${scope}/${match[3]}` : match[3]
    const valid = validate(name)

    return {
      valid: valid.validForOldPackages,
      name: name,
      scope: scope ? scope : null,
      version: version ? version : 'last',
      escapedName: querystring.escape(name),
    }
  }
}
