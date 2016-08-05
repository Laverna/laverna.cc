'use strict';

module.exports = (gulp, $) => {

    gulp.task('copy:css', () => {
        return gulp.src('./app/styles/main.css')
        .pipe($.purifycss(['./app/*.html']))
        .pipe($.cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./dist/styles'));
    });

    gulp.task('copy:html', () => {
        return gulp.src('./app/*.html')
        .pipe($.htmlmin({
            collapseWhitespace : true,
            quoteCharacter     : '\'',
        }))
        .pipe(gulp.dest('./dist/'));
    });

    gulp.task('copy:assets', () => {
        return gulp.src([
            './app/fonts/**/*.+(eot|svg|ttf|woff)',
            './app/images/**/*',
            './app/*.+(txt|ico)',
        ], {base: './app'})
        .pipe(gulp.dest('./dist/'));
    });

};
