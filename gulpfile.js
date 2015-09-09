// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var sass = require('gulp-sass');



// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('assets/styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('assets/styles/'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('assets/styles/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['sass', 'watch']);
