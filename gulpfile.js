"use strict";
const webpack = require('webpack-stream');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
  scope: [
    'devDependencies'
  ]
});

/* gulp-sass-dev */
gulp.task('gulp-sass-dev', () => {
  return gulp.src('app/styles/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.wait(300))
    .pipe($.sass()).on('error', (e) => {
      $.util.log('\x1b[31m%s\x1b[0m', e);
      del('dist/css/main.css')
    })
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'));
});

/* gulp-sass-build */
gulp.task('gulp-sass-build', () => {
  return gulp.src('app/styles/main.scss')
    .pipe($.sass())
    .pipe($.autoprefixer())
    .pipe($.cleanCss())
    .pipe(gulp.dest('dist/css'));
});

/* babel-loader-dev*/
gulp.task('babel-loader-dev', () => {
  return gulp.src('')
    .pipe(webpack({
      entry: {
        app: './app/scripts/main.js',
      },
      output: {
        filename: 'main.js',
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
      devtool: 'source-map',
    }))
    .pipe(gulp.dest('dist/js'));
});

/* babel-loader-build */
gulp.task('babel-loader-build', () => {
  return gulp.src('')
    .pipe(webpack({
      entry: {
        app: './app/scripts/main.js',
      },
      output: {
        filename: 'main.js',
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
    .pipe(gulp.dest('dist/js'));
});

/* gulp-file-include */
gulp.task('gulp-file-include', () => {
  return gulp.src('app/views/templates/*.html')
    // .pipe($.changed('dist'))
    .pipe($.fileInclude({
      prefix: '@',
      basedir: '@file'
    }))
    .pipe(gulp.dest('dist'));
});

/* gulp-htmlhint */
gulp.task('gulp-htmlhint', () => {
  return gulp.src('dist/*.html')
    .pipe($.htmlhint())
    .pipe($.htmlhint.reporter())
    .pipe($.debug({
      title: 'unicorn:'
    }));
});

/* gulp-useref */
gulp.task('gulp-useref', () => {
  return gulp.src('dist/*.html')
    .pipe($.useref())
    .pipe($.if('*.css', $.autoprefixer()))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe($.if('*.js', $.uglify()))
    .pipe(gulp.dest('dist'));
});

/* gulp-rev */
gulp.task('gulp-rev', function () {
  return gulp.src(
      [
        'dist/css/vendor.min.css',
        'dist/css/main.min.css',
        'dist/js/vendor.min.js',
        'dist/js/main.min.js'
      ], {
        base: 'dist'
      })
    .pipe($.rev())
    .pipe(gulp.dest('dist'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('dist'));
});

/* gulp-rev-replace */
gulp.task('gulp-rev-replace', function () {
  return gulp.src('dist/*.html')
    .pipe($.revReplace({
      manifest: gulp.src('dist/rev-manifest.json')
    }))
    .pipe(gulp.dest('dist'));
});

/* gulp-move-image-dev */
gulp.task('gulp-move-image-dev', () => {
  return gulp.src('app/images/*')
    .pipe($.cached())
    .pipe(gulp.dest('dist/images'));
});

/* gulp-imagemin-build */
gulp.task('gulp-imagemin-build', () => {
  return gulp.src('app/images/*')
    // .pipe($.imagemin({
    //     optimizationLevel: 5,
    //     progressive: true,
    //     interlaced: true,
    //     verbose: true
    // }))
    .pipe(gulp.dest('dist/images'));
});

/* gulp-move-font */
gulp.task('gulp-move-font', () => {
  return gulp.src('app/fonts/*')
    .pipe($.cached())
    .pipe(gulp.dest('dist/fonts'));
});

/* browser-sync */
gulp.task('browser-sync', () => {
  browserSync.init({
    server: true,
    serveStatic: [{
      dir: 'dist'
    }]
  });
});

/* gulp-watch */
gulp.task('gulp-watch', () => {
  gulp.watch('app/styles/**/*', () => {
    runSequence('gulp-sass-dev', browserSync.reload);
  });
  gulp.watch('app/scripts/**/*', () => {
    runSequence('babel-loader-dev', browserSync.reload);
  });
  gulp.watch('app/views/**/*', () => {
    runSequence('gulp-file-include', browserSync.reload);
  });
  gulp.watch('app/images/*', () => {
    runSequence('gulp-move-image-dev', browserSync.reload);
  });
  gulp.watch('app/fonts/*', () => {
    runSequence('gulp-move-font', browserSync.reload);
  });
});

/* del-dist */
gulp.task('del-dist', () => {
  return del('dist');
});

/* del-file */
gulp.task('del-file', () => {
  return del(
    [
      'dist/css/main.css',
      // 'dist/css/vendor.min.css',
      // 'dist/css/main.min.css',
      'dist/js/main.js',
      // 'dist/js/vendor.min.js',
      // 'dist/js/main.min.js',
      'dist/rev-manifest.json'
    ]
  );
});

/* Project develop */
gulp.task('default', () => {
  runSequence(
    'del-dist', [
      'gulp-sass-dev',
      'babel-loader-dev',
      'gulp-file-include',
      'gulp-move-image-dev',
      'gulp-move-font'
    ],
    'browser-sync',
    'gulp-watch'
  );
});

/* Project build */
gulp.task('build', () => {
  runSequence(
    'del-dist', [
      'gulp-sass-build',
      'babel-loader-build',
      'gulp-file-include',
      'gulp-imagemin-build',
      'gulp-move-font'
    ],
    'gulp-useref',
    // 'gulp-rev',
    // 'gulp-rev-replace',
    // 'gulp-htmlhint',
    'del-file',
    'browser-sync'
  );
});