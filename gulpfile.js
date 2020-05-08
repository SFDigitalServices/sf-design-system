const autoprefix = require('gulp-autoprefixer')
const config = require('./config.json')
const fractal = require('./fractal')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const imagemin = require('gulp-imagemin')
// const importOnce = require('node-sass-import-once')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const nodeSassIndexImporter = require('./lib/node-sass-index-importer')
const nodeSassWarnDuplicateImporter = require('./lib/node-sass-warn-duplicate-importer')

const logger = fractal.cli.console
const production = process.env.NODE_ENV === 'production'

// Pattern Lab CSS.
// -------------------------------------------------------------- //
const css = () => {
  // sass.compiler = require('sass')
  return gulp.src(config.css.src)
    .pipe(gulpif(!production, plumber({
      errorHandler: function (error) {
        notify.onError({
          title: 'Gulp',
          subtitle: 'Failure!',
          message: 'Error: <%= error.message %>',
          sound: 'Beep'
        })(error)
        this.emit('end')
      }
    })))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      errLogToConsole: true,
      includePaths: config.css.includePaths,
      importer: [
        nodeSassIndexImporter,
        nodeSassWarnDuplicateImporter
      ]
    }))
    .pipe(autoprefix())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.css.dest))
}

const images = () => {
  return gulp.src(config.images.src)
    .pipe(imagemin())
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest(config.images.dest))
}

// Watch task.
// ------------------------------------------------------------------- //

const watch = async () => {
  gulp.watch(config.css.src, css)
  gulp.watch(config.images.src, images)
}

// fractal dev server
const serve = () => {
  const server = fractal.web.server({ // uses fractal's builtin integration with browsersync
    sync: true,
    syncOptions: {
      open: true,
      notify: true,
      reload: true
    }
  })
  server.on('error', err => logger.error(err.message))
  return server.start().then(() => {
    logger.success(`Fractal server is now running at ${server.url}`)
  })
}

const fractalExport = async () => {
  fractal.web.builder().build().then(function () {
    logger.success('Fractal static build complete')
    // logger.log('Replacing css paths for gh-pages')
    // return gulp.src(['./export/components/preview/**/*.html'])
    //     .pipe(replace(/href="\/css\//g, 'href="/sf-design-system/css/'))
    //     .pipe(replace(/src="\/js\//g, 'src="/sf-design-system/js/'))
    //     .pipe(gulp.dest('./export/components/preview'));
  })
}

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
