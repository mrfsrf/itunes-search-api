'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserify = require("browserify");
const source = require('vinyl-source-stream');

const babelify = require("babelify");
const browserSync = require('browser-sync').create();

function style() {
  return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}

function build() {

    return browserify({
        entries: ["src/js/index.js"]
    })
    .transform(babelify.configure({
      presets: ['@babel/preset-env']
    }))
    // .pipe(gulp.replace('API_KEY', process.env.API_KEY))
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist/js/"));
  
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    port: 8080
  });

  gulp.watch('src/scss/*.scss', style).on('change', browserSync.reload);
  gulp.watch('src/js/*.js', build).on('change', browserSync.reload);
  gulp.watch('dist/js/*.js').on('change', browserSync.reload);
  gulp.watch('./*.html').on('change', browserSync.reload);
}

exports.style = style;
exports.build = build;
// exports.js = js;
exports.watch = watch;