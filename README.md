# download-npm
Download the modules from the NPM registry to HTML5 file system API

## Installation
```shell
npm install download-npm
```

## Features

* Library to download packages
* Supports scoped packages

## Out of the scope
* It can not use the registry defined in your `.npmrc` file

## Usage

*downloadNpm* takes an package name and a path as arguments and returns a promise, a promise that resolves once the package has been downloaded to the folder set in path.

```js
import downloadNpm from 'download-npm'

downloadNpm(
  'modulname@version', // for example, express@4.0.0-rc4 or tape@latest etc
  '/tmp' // the path to download
).then()
```