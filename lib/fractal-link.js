const { NODE_ENV } = process.env
const prod = NODE_ENV === 'production'

const prefix = prod ? '../..' : ''
const suffix = prod ? '.html' : ''

module.exports = handle => {
  if (handle.charAt(0) === '@') {
    handle = handle.substr(1)
  }
  return `${prefix}/components/detail/${handle}${suffix}`
}
