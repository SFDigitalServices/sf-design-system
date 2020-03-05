import gulp from 'gulp'

// Include plugins.
import sass from 'gulp-sass'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import autoprefix from 'gulp-autoprefixer'
import glob from 'gulp-sass-glob'
import sourcemaps from 'gulp-sourcemaps'
// import shell from 'gulp-shell';
import concat from 'gulp-concat'
import babel from 'gulp-babel'
import imagemin from 'gulp-imagemin'
import gulpif from 'gulp-if'
import rename from 'gulp-rename'
// Initialize browser sync.

// Read the default configuration.
const config = require('./config.json')

const importOnce = require('node-sass-import-once')

const fractal = require('./fractal')
const logger = fractal.cli.console
const production = process.env.NODE_ENV === 'production'

// Require a copy of the JS compiler for uswds.
// the gulptask is called "javascript"
// the following task compiles the node_modules/uswds/src/js/start.js file.
// require('./gulptasks/javascript');

// Pattern Lab CSS.
// -------------------------------------------------------------- //
const css = () => {
  console.log(production)
  return gulp.src(config.css.src)
    .pipe(glob())
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
      importer: importOnce
    }))
    .pipe(autoprefix('last 2 versions', '> 1%', 'ie 9', 'ie 10'))
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
  gulp.watch(config.js.src, js)
  gulp.watch(config.css.src, css)
  gulp.watch(config.images.src, images)
}

// // Component JS.
// // -------------------------------------------------------------------- //
const js = () => {
  return gulp.src(config.js.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.js.dest))
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
  fractal.web.builder({
    dest: './export'
  }).build().then(function () {
    logger.success('Fractal static build complete')
    logger.log('Replacing css paths for gh-pages')
    // return gulp.src(['./export/components/preview/**/*.html'])
    //     .pipe(replace(/href="\/css\//g, 'href="/sf-design-system/css/'))
    //     .pipe(replace(/src="\/js\//g, 'src="/sf-design-system/js/'))
    //     .pipe(gulp.dest('./export/components/preview'));
  })
}

exports.css = gulp.series(css)
exports.js = gulp.series(js)
exports.images = gulp.series(images)

exports.build = gulp.parallel(css, js, images)

exports.export = gulp.series(
  gulp.parallel(css, js, images),
  fractalExport
)

exports.fractal = gulp.series(
  gulp.parallel(css, js, images),
  gulp.parallel(watch, serve)
)
