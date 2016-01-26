'use strict';
var gulp     = require('gulp'),
    sequence = require('gulp-sequence'),
    del      = require('del'),
    connect  = require('gulp-connect'),
    pureCss  = require('gulp-purifycss'),
    minCss   = require('gulp-minify-css'),
    minHtml  = require('gulp-minify-html'),
    sass     = require('gulp-sass'),
    replace  = require('gulp-replace'),
    util     = require('gulp-util'),
    fontmin = require('gulp-fontmin'),
    shell    = require('gulp-shell'),
    release  = util.env.release || '0.7.1',
    downLink = 'https://github.com/Laverna/laverna/releases/download/' + release + '/laverna-' + release + '-:platform:.zip';

/**
 * Livereload
 */
gulp.task('reload:html', function() {
    return gulp.src('**/*.html')
    .pipe(connect.reload());
});

gulp.task('reload:js', ['rebuild'], function() {
    return gulp.src([
        '*.js',
    ])
    .pipe(connect.reload());
});

gulp.task('prebuild:sass', function() {
    return gulp.src(
        './app/styles/main.scss'
    )
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./app/styles'))
    .pipe(connect.reload());
});

gulp.task('default', ['prebuild:sass'], function() {
    connect.server({
        livereload : true,
        root       : 'app'
    });

    gulp.watch('app/index.html', ['reload:html']);
    gulp.watch('app/styles/*.scss', ['prebuild:sass']);
});


/**
 * Build
 */
gulp.task('copy:css', function() {
    return gulp.src(
        './app/styles/main.scss'
    )
    .pipe(sass().on('error', sass.logError))
    .pipe(pureCss(['./app/index.html']))
    .pipe(minCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('./dist/styles'));
});

gulp.task('copy:html', function() {
    return gulp.src(
        './app/**/*.html'
    )
    .pipe(minHtml())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy:assets', function() {
    return gulp.src([
        './app/fonts/**/*.+(eot|svg|ttf|woff)',
        './app/images/**/*',
        './app/*.+(txt|ico)'
    ], {base: './app'})
    .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function() {
    return del(['dist/**/*']);
});

// Replace download links
gulp.task('replace:download', function() {
    return gulp.src('./dist/index.html')
    .pipe(replace('{{download-linux64}}', downLink.replace(':platform:', 'linux-x64')))
    .pipe(replace('{{download-linux32}}', downLink.replace(':platform:', 'linux-ia32')))
    .pipe(replace('{{download-windows64}}', downLink.replace(':platform:', 'win32-x64')))
    .pipe(replace('{{download-windows32}}', downLink.replace(':platform:', 'win32-ia32')))
    .pipe(replace('{{download-mac}}', downLink.replace(':platform:', 'darwin-x64')))
    .pipe(replace('{{download-hosted}}', downLink.replace('laverna-' + release + '-:platform:', 'webapp')))
    .pipe(gulp.dest('./dist'));
});

// Optimize web fonts
gulp.task('fontspider', function() {
    return gulp.src('./dist/index.html', {read: false})
    .pipe(shell(
        './node_modules/font-spider/bin/font-spider ./dist/index.html'
    ));
});

// Fontspider can't optimize some Open Sans fonts
function minifyFont(name, text, cb) {
    gulp.src('./dist/fonts/' + name + '/*.ttf')
    .pipe(fontmin({
        text: text
    }))
    .pipe(gulp.dest('./dist/fonts/' + name))
    .on('end', cb);
}
gulp.task('fontmin', function(cb) {
    var buffers = [];

    gulp.src('./dist/index.html')
    .on('data', function(file) {
        buffers.push(file.contents);
    })
    .on('end', function() {
        var text = Buffer.concat(buffers).toString('utf-8');
        minifyFont('Open Sans', text, cb);
    });
});

/**
 * Example:
 * `gulp build --release 0.7.1`
 */
gulp.task('build', sequence(
    'clean',
    [
        'copy:css',
        'copy:html',
        'copy:assets'
    ],
    'replace:download',
    [
        'fontspider',
        'fontmin'
    ]
));
