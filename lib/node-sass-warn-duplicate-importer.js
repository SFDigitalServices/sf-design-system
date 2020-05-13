const { dirname, join } = require('path')

const imports = new Map()

module.exports = function nodeSassWarnDuplicateImporter (url, prev, done) {
  const path = join(dirname(prev), url)
  if (imports.has(path)) {
    console.warn('!!! duplicate import of "%s": %s then %s', path, imports.get(path), prev)
  } else {
    imports.set(path, prev)
  }
  done()
}
