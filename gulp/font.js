'use strict';

module.exports = (gulp, $) => {
    // Fontspider can't optimize some Open Sans fonts
    function minifyFont(name, text, cb) {
        gulp.src(`./dist/fonts/${name}/*.ttf`)
        .pipe($.fontmin({
            text,
        }))
        .pipe(gulp.dest(`./dist/fonts/${name}`))
        .on('end', cb);
    }

    gulp.task('fontmin', cb => {
        const buffers = [];

        gulp.src('./dist/*.html')
        .on('data', file => {
            buffers.push(file.contents);
        })
        .on('end', () => {
            const text = Buffer.concat(buffers).toString('utf-8');
            minifyFont('Open Sans', text, cb);
        });
    });

    // Optimize web fonts
    gulp.task('fontspider', $.shell.task([
        './node_modules/.bin/font-spider ./dist/index.html ./dist/sponsors.html',
    ], {verbose: true}));
};
