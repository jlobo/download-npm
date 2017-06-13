import 'babel-polyfill'
import DownloadNpm from './downloadNpm'
module.exports = DownloadNpm.instance.download.bind(DownloadNpm.instance)
