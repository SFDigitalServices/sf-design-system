const { NODE_ENV } = process.env
const production = NODE_ENV === 'production'

const prefix = production ? '../..' : ''
const suffix = production ? '.html' : ''

module.exports = handle => {
  if (handle.charAt(0) === '@') {
    handle = handle.substr(1)
  }
  return `${prefix}/components/detail/${handle}${suffix}`
}
