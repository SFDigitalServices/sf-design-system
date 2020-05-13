const autoprefix = require('gulp-autoprefixer')
const fractal = require('./fractal')
const gulp = require('gulp')
const imagemin = require('gulp-imagemin')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const nodeSassIndexImporter = require('./lib/node-sass-index-importer')
const nodeSassWarnDuplicateImporter = require('./lib/node-sass-warn-duplicate-importer')

const logger = fractal.cli.console
const { NODE_ENV } = process.env
const production = NODE_ENV === 'production'

const imageGlob = 'src/**/*.{png,gif,jpg}'

module.exports = {
  css,
  images,
  build: gulp.parallel(css, images),
  export: gulp.series(
    gulp.parallel(css, images),
    fractalExport
  ),
  fractal: gulp.series(
    gulp.parallel(css, images),
    gulp.parallel(watch, serve)
  )
}

function css () {
  const {
    SASS_COMPILER: compiler = 'sass',
    SASS_OUTPUT_STYLE: outputStyle = defaultSassOutputStyle(compiler, production)
  } = process.env

  const importers = []
  if (compiler) {
    sass.compiler = require(compiler)
  }
  if (compiler === 'node-sass') {
    importers.push(nodeSassIndexImporter)
  }

  return gulp.src('src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle,
      errLogToConsole: true,
      importer: importers
    }))
    .pipe(autoprefix())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/dist/css'))

  function defaultSassOutputStyle (compiler, production) {
    return {
      'node-sass': {
        true: 'compressed',
        false: 'nested'
      },
      sass: {
        true: 'compressed',
        false: 'expanded'
      }
    }[compiler][production]
  }
}

function images () {
  return gulp.src(imageGlob)
    .pipe(imagemin())
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest('public/dist/images'))
}

function watch () {
  gulp.watch('src/scss', css)
  gulp.watch(imageGlob, images)
}

async function serve () {
  // uses fractal's builtin integration with browsersync
  const server = fractal.web.server({
    sync: true,
    syncOptions: {
      open: true,
      notify: true,
      reload: true
    }
  })

  server.on('error', err => logger.error(err.message))

  await server.start()
  logger.success(`Fractal server is now running at ${server.url}`)
}

async function fractalExport () {
  await fractal.web.builder().build()
  logger.success('Fractal static build complete')
}
