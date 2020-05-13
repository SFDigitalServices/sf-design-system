const { dirname, join } = require('path')
const { statSync, existsSync } = require('fs')

module.exports = function nodeSassIndexImporter (url, prev, done) {
  console.warn('@import "%s" in:', url, prev)
  try {
    const dir = join(dirname(prev), url)
    if (statSync(dir).isDirectory()) {
      const file = join(dir, '_index.scss')
      if (existsSync(file)) {
        return done({ file })
      }
    }
  } catch (error) {
    // console.warn('error:', error)
  }
  return done()
}
