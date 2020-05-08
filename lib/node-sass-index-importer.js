const { dirname, join } = require('path')
const { statSync, existsSync } = require('fs')

module.exports = function nodeSassIndexImporter (url, prev, done) {
  try {
    const dir = join(dirname(prev), url)
    if (statSync(dir).isDirectory()) {
      const index = join(dir, '_index.scss')
      if (existsSync(index)) {
        return done({ path: index })
      }
    }
  } catch (error) {
    return done()
  }
  done()
}
