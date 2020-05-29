const chroma = require('chroma-js')
const colors = require('./colors')

const contrast = {}

for (const [a, x] of Object.entries(colors)) {
  contrast[a] = {}

  for (const [b, y] of Object.entries(colors)) {
    if (a !== b) {
      contrast[a][b] = chroma.contrast(x, y)
    }
  }
}

module.exports = contrast
