const { series, parallel, src, dest, watch, task } = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

sass.compiler = require('node-sass');

function sassTask() {
  return src('src/style.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(browserSync.stream({match: '**/*.css'}))
    .pipe(dest('./dist'))
}

function jsTask() {
  return src('src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    // .pipe(uglify({}))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./dist'))
    .pipe(browserSync.stream({match: 'src/*.js'}))
}

function browserSyncTask() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });

  watch('./src/style.scss', sassTask).on('change', browserSync.reload);
  watch("./src/*.js", jsTask).on('change', browserSync.reload);
  watch("./*.html").on('change', browserSync.reload);
};

exports.default = series(parallel(sassTask, jsTask), browserSyncTask)
