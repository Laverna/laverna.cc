'use strict';

const gulp  = require('gulp'),
    $       = require('gulp-load-plugins')(),
    path    = require('path'),
    release = $.util.env.release || '0.7.1';

$.del     = require('del');
$.request = require('superagent');
$.Q       = require('q');

const data = {release};
data.releaseLink = 'https://github.com/Laverna/laverna/releases/download/';
data.downLink    = `${data.releaseLink}${release}/laverna-${release}-`;

// Load and create tasks
['copy', 'font', 'template'].forEach(name => {
    require(`./gulp/${name}`)(gulp, $, data);
});

// Livereload server.
gulp.task('default', ['sass', 'template'], () => {
    $.connect.server({
        livereload : true,
        root       : 'app',
    });

    gulp.watch('app/templates/*.html', ['template']);
    gulp.watch('app/styles/*.scss', ['sass']);
});

/**
 * Build.
 * Example:
 * `gulp build --release 0.7.1`
 */
gulp.task('build', $.sequence(
    'clean',
    'template',
    'sass',
    [
        'copy:css',
        'copy:html',
        'copy:assets',
    ],
    [
        'fontspider',
        'fontmin',
        'image',
    ]
));

gulp.task('clean', () => {
    return $.del(['dist/**/*']);
});

gulp.task('sass', () => {
    return gulp.src('./app/styles/main.scss')
    .pipe($.sass({
        includePaths: [
            path.join(__dirname, './node_modules/'),
        ],
    }).on('error', $.sass.logError))
    .pipe(gulp.dest('./app/styles'))
    .pipe($.connect.reload());
});

gulp.task('image', () => {
    return gulp.src('./dist/images/**/*')
    .pipe($.image())
    .pipe(gulp.dest('./dist/images'));
});
