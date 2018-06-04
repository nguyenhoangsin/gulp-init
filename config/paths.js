'use strict'

module.exports = {
  views: {
    src: 'src/views/templates/**/*.html',
    dest: 'build/',
    watch: 'src/views/**/*.html'
  },
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'build/css/',
    watch: 'src/styles/**/*.scss'
  },
  scripts: {
    src: './src/scripts/main.js',
    dest: 'build/js/',
    watch: 'src/scripts/**/*.js'
  },
  fonts: {
    src: 'src/fonts/**/*',
    dest: 'build/fonts/',
    watch: 'src/fonts/**/*'
  },
  images: {
    src: 'src/images/**/*',
    dest: 'build/images/',
    watch: 'src/images/**/*'
  },
  basedir: 'build/',
  filename: {
    JWO: 'main.js'
  }

}