'use strict'

const webpack = require('webpack-stream')
const browserSync = require('browser-sync').create()
const del = require('del')
const gulp = require('gulp')
const $ = require('gulp-load-plugins')({
  scope: [
    'devDependencies'
  ]
})
const paths = require('../config/paths')
const tasks = {
  showTime: (method) => {
    const checkTime = (i) => {
      return (i < 10) ? "0" + i : i
    }
    const time = new Date()
    const h = checkTime(time.getHours())
    const m = checkTime(time.getMinutes())
    const s = checkTime(time.getSeconds())
    const timeFormat = `[${h}:${m}:${s}]`
    return console.log('\x1b[32m', `${timeFormat} Start ${method}...`)
  },
  views: () => {
    tasks.showTime('views')
    return gulp.src(paths.views.src)
      .pipe($.fileInclude({
        prefix: '@',
        basedir: '@file'
      }))
      .pipe(gulp.dest(paths.views.dest))
      .pipe(browserSync.stream())
  },
  styles: () => {
    tasks.showTime('styles')
    return gulp.src(paths.styles.src)
      .pipe($.sourcemaps.init())
      .pipe($.wait(300))
      .pipe($.sass()).on('error', (e) => {
        $.util.log('\x1b[31m%s\x1b[0m', e)
        del(paths.styles.dest)
      })
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browserSync.stream())
  },
  scripts: () => {
    tasks.showTime('scripts')
    return gulp.src(paths.scripts.src)
      .pipe(webpack({
        entry: {
          src: paths.scripts.src,
        },
        output: {
          filename: paths.filename.JWO,
        },
        module: {
          rules: [{
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['babel-preset-env']
              }
            }
          }],
        },
        devtool: 'source-map'
      }))
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(browserSync.stream())
  },
  fonts: () => {
    tasks.showTime('fonts')
    return gulp.src(paths.fonts.src)
      .pipe($.cached())
      .pipe(gulp.dest(paths.fonts.dest))
      .pipe(browserSync.stream())
  },
  images: () => {
    tasks.showTime('images')
    return gulp.src(paths.images.src)
      .pipe($.changed(paths.images.dest))
      .pipe(gulp.dest(paths.images.dest))
      .pipe(browserSync.stream())
  },
  server: () => {
    tasks.showTime('server')
    browserSync.init({
      server: true,
      serveStatic: [{
        dir: paths.basedir
      }]
    })
  },
  watch: () => {
    tasks.showTime('watch')
    gulp.watch(paths.views.watch, tasks.views)
    gulp.watch(paths.styles.watch, tasks.styles)
    gulp.watch(paths.scripts.watch, tasks.scripts)
    gulp.watch(paths.fonts.watch, tasks.fonts)
    gulp.watch(paths.images.watch, tasks.images)
  },
  delete: () => {
    tasks.showTime('delete')
    return del(paths.basedir)
  }
}
const dev = gulp.series(
  tasks.delete,
  gulp.parallel(
    tasks.views,
    tasks.styles,
    tasks.scripts,
    tasks.fonts,
    tasks.images
  ),
  gulp.parallel(
    tasks.server,
    tasks.watch
  )
)

exports.dev = dev