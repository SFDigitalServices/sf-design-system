const { join } = require('path')
const theme = require('./src/theme')
const defaultContext = { theme }

/* Create a new Fractal instance and export it for use elsewhere if required */
const fractal = module.exports = require('@frctl/fractal').create()

fractal.set('project.title', 'San Francisco Design System')

fractal.components.set('default.context', defaultContext)
fractal.docs.set('default.context', defaultContext)

const engine = require('@frctl/nunjucks')({
  filters: {
    markdownify: require('nunjucks-markdown-filter'),
    link: require('./lib/fractal-link')
  }
})

fractal.components.engine(engine)
fractal.components.set('ext', '.html')

fractal.web.theme(require('@frctl/mandelbrot')({
  skin: 'white',
  panels: ['html', 'notes', 'info']
}))

/* Tell Fractal where the components will live */
fractal.components.set('path', join(__dirname, 'src/components'))

/* Tell Fractal where the documentation pages will live */
fractal.docs.set('path', 'docs')

/* Tell the Fractal web preview plugin where to look for static assets. */
fractal.web.set('static.path', 'public/dist')
fractal.web.set('builder.dest', 'export')

/* Add Twig adapter. */
// const twigAdapter = require('@wondrousllc/fractal-twig-drupal-adapter')
// const twig = twigAdapter({handlePrefix: '@components/'})

// fractal.components.engine(twig)
// fractal.components.set('ext', '.twig')

module.exports = fractal
