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

/* dev:sass */
gulp.task('dev:sass', () => {
    return gulp.src('app/styles/main.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass()).on('error', (e) => {
            $.util.log('\x1b[31m%s\x1b[0m', e);
            del('dist/css/main.css')
        })
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'));
});

/* build:sass */
gulp.task('build:sass', () => {
    return gulp.src('app/styles/main.scss')
        .pipe($.sass())
        .pipe($.autoprefixer())
        .pipe($.cleanCss())
        .pipe(gulp.dest('dist/css'));
});

/* dev:babel */
gulp.task('dev:babel', () => {
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

/* build:babel */
gulp.task('build:babel', () => {
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

/* dev:html-file-include */
gulp.task('dev:html-file-include', () => {
    return gulp.src('app/views/templates/*.html')
        // .pipe($.changed('dist'))
        .pipe($.fileInclude({
            prefix: '@',
            basedir: '@file'
        }))
        .pipe(gulp.dest('dist'));
});

/* build:html-useref */
gulp.task('build:html-useref', () => {
    return gulp.src('dist/*.html')
        .pipe($.useref())
        .pipe($.if('*.css', $.autoprefixer()))
        .pipe($.if('*.css', $.cleanCss()))
        .pipe($.if('*.js', $.uglify()))
        .pipe(gulp.dest('dist'));
});

/* build:html-jsbeautifier */
gulp.task('build:html-jsbeautifier', () => {
    return gulp.src('dist/*.html')
        .pipe($.jsbeautifier({
            indent_char: ' ',
            indent_size: 2
        }))
        .pipe(gulp.dest('dist'));
});

/* build:html-htmlhint */
gulp.task('build:html-htmlhint', () => {
    return gulp.src('dist/*.html')
        .pipe($.htmlhint())
        .pipe($.htmlhint.reporter())
        .pipe($.debug({
            title: 'unicorn:'
        }));
});

/* build:rev */
gulp.task('build:rev', function () {
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

/* build:rev-replace */
gulp.task('build:rev-replace', function () {
    return gulp.src('dist/*.html')
        .pipe($.revReplace({
            manifest: gulp.src('dist/rev-manifest.json')
        }))
        .pipe(gulp.dest('dist'));
});

/* dev:image */
gulp.task('dev:image', () => {
    return gulp.src('app/images/*')
        .pipe($.cached())
        .pipe(gulp.dest('dist/images'));
});

/* build:image */
gulp.task('build:image', () => {
    return gulp.src('app/images/*')
        .pipe($.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            verbose: true
        }))
        .pipe(gulp.dest('dist/images'));
});

/* move:font */
gulp.task('move:font', () => {
    return gulp.src('app/fonts/*')
        .pipe($.cached())
        .pipe(gulp.dest('dist/fonts'));
});

/* dev:server */
gulp.task('dev:server', () => {
    browserSync.init({
        server: true,
        serveStatic: [{
            dir: 'dist'
        }]
    });
});

/* dev:watch */
gulp.task('dev:watch', () => {
    gulp.watch('app/styles/**/*', () => {
        runSequence('dev:sass', browserSync.reload);
    });
    gulp.watch('app/scripts/**/*', () => {
        runSequence('dev:babel', browserSync.reload);
    });
    gulp.watch('app/views/**/*', () => {
        runSequence('dev:html-file-include', browserSync.reload);
    });
    gulp.watch('app/images/*', () => {
        runSequence('dev:image', browserSync.reload);
    });
    gulp.watch('app/fonts/*', () => {
        runSequence('move:font', browserSync.reload);
    });
});

/* del:dist */
gulp.task('del:dist', () => {
    return del('dist');
});

/* del:file */
gulp.task('del:file', () => {
    return del(
        [
            'dist/css/main.css',
            'dist/css/vendor.min.css',
            'dist/css/main.min.css',
            'dist/js/main.js',
            'dist/js/vendor.min.js',
            'dist/js/main.min.js',
            'dist/rev-manifest.json'
        ]
    );
});

/* Develop project */
gulp.task('default', () => {
    runSequence(
        'del:dist', [
            'dev:sass',
            'dev:babel',
            'dev:html-file-include',
            'dev:image',
            'move:font'
        ],
        'dev:server',
        'dev:watch'
    );
});

/* Build project */
gulp.task('build', () => {
    runSequence(
        'del:dist', [
            'dev:html-file-include',
            'build:sass',
            'build:babel',
            'build:image',
            'move:font'
        ],
        'build:html-useref',
        'build:rev',
        'build:rev-replace',
        'build:html-jsbeautifier',
        'build:html-htmlhint',
        'del:file',
        'dev:server'
    );
});