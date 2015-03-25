// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp'), rjs = require('gulp-requirejs-bundler'), concat = require('gulp-concat'), clean = require('gulp-clean'),
    replace = require('gulp-replace'), minifyCSS = require('gulp-minify-css'), uglify = require('gulp-uglify'), htmlreplace = require('gulp-html-replace');


// Concatenates and minifies JS files
gulp.task('js', function() {
  return gulp.src(['src/bower_modules/jquery/dist/jquery.min.js','src/bower_modules/components-bootstrap/js/bootstrap.min.js', 
            'src/bower_modules/knockout/dist/knockout.js', 'src/app/*.js'])
          .pipe(concat('app.js'))
          .pipe(uglify())
          .pipe(gulp.dest('./dist/'));
});

// Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('css', function () {
    var bowerCss = gulp.src('src/bower_modules/components-bootstrap/css/bootstrap.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')).pipe(minifyCSS({keepBreaks:true})),
        appCss = gulp.src('src/css/*.css').pipe(minifyCSS({keepBreaks:true})),
        combinedCss = es.concat(bowerCss, appCss).pipe(concat('css.css')),
        fontFiles = gulp.src('./src/bower_modules/components-bootstrap/fonts/*', { base: './src/bower_modules/components-bootstrap/' });
    return es.concat(combinedCss.pipe(minifyCSS()), fontFiles)
        .pipe(gulp.dest('./dist/'));
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function() {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'app.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});

gulp.task('default', ['html', 'js', 'css'], function(callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
});
