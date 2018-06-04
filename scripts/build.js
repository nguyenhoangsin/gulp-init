'use strict'

const webpack = require('webpack-stream')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
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
  },
  styles: () => {
    tasks.showTime('styles')
    return gulp.src(paths.styles.src)
      .pipe($.sass())
      .pipe($.autoprefixer())
      .pipe($.cleanCss())
      .pipe(gulp.dest(paths.styles.dest))
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
        plugins: [
          new UglifyJsPlugin()
        ]
      }))
      .pipe(gulp.dest(paths.scripts.dest))
  },
  fonts: () => {
    tasks.showTime('fonts')
    return gulp.src(paths.fonts.src)
      .pipe(gulp.dest(paths.fonts.dest))
  },
  images: () => {
    tasks.showTime('images')
    return gulp.src(paths.images.src)
      .pipe(gulp.dest(paths.images.dest))
  },
  delete: () => {
    tasks.showTime('delete')
    return del(paths.basedir)
  },
  refs: () => {
    tasks.showTime('refs')
    return gulp.src(`${paths.basedir}*.html`)
      .pipe($.useref())
      .pipe($.if('*.css', $.autoprefixer()))
      .pipe($.if('*.css', $.cleanCss()))
      .pipe($.if('*.js', $.uglify()))
      .pipe(gulp.dest(paths.basedir))
  }
}
const prod = gulp.series(
  tasks.delete,
  gulp.parallel(
    tasks.views,
    tasks.styles,
    tasks.scripts,
    tasks.fonts,
    tasks.images
  ),
  tasks.refs
)

exports.prod = prod