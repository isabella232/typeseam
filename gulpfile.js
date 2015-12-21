var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');

gulp.task('fonts', function(){
  return gulp.src('./node_modules/bootstrap/fonts/*.{ttf,woff,woof2,eot,svg}')
    .pipe(gulp.dest('typeseam/static/fonts/'))
});

gulp.task('less_dev', function(){
  return gulp.src('./frontend/less/main.less')
    .pipe(less())
    .pipe(gulp.dest('./typeseam/static/css/'));
});

jsfiles = [
  './node_modules/jquery/dist/jquery.js',
  './frontend/js/main.js',
];

gulp.task('js_dev', function(){
  return gulp.src(jsfiles)
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./typeseam/static/js/'));
})

gulp.task('watch', function(){
  gulp.watch('./frontend/js/**/*.js', ['js_dev']);
  gulp.watch('./frontend/less/**/*.less', ['less_dev']);
})

gulp.task('build', ['fonts', 'less_dev', 'js_dev'])
gulp.task('default', ['build', 'watch'])