// Include gulp
var gulp = require('gulp');

// Include plugins

var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');


// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('assets/styles/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 10', 'ie 9']
        }))
        .pipe(sourcemaps.write('assets/styles/'))
        .pipe(gulp.dest('assets/styles/'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('assets/styles/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['sass', 'watch']);
