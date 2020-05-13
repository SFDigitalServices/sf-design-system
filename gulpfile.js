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

exports.css = gulp.series(css)
exports.images = gulp.series(images)

exports.build = gulp.parallel(css, images)

exports.export = gulp.series(
  gulp.parallel(css, images),
  fractalExport
)

exports.fractal = gulp.series(
  gulp.parallel(css, images),
  gulp.parallel(watch, serve)
)

function css () {
  return gulp.src('src/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: production ? 'compact' : 'nested',
      errLogToConsole: true,
      importer: [
        nodeSassIndexImporter,
        nodeSassWarnDuplicateImporter
      ]
    }))
    .pipe(autoprefix())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/dist/css'))
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
