const { dirname, join } = require('path')

const imports = new Set()

module.exports = function nodeSassWarnDuplicateImporter (url, prev, done) {
  const path = join(dirname(prev), url)
  if (imports.has(path)) {
    console.warn('!!! duplicate import:', path)
  } else {
    imports.add(path)
  }
  done()
}
