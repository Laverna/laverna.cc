'use strict';

const getSponsors = require('./bountysource').getSponsors;

module.exports = (gulp, $, data) => {
    gulp.task('template', () => {
        return getSponsors(gulp, $)
        .then(sponsors => {
            return gulp.src([
                './app/templates/*.html',
                '!./app/templates/layout.html',
            ])
            .pipe($.nunjucksRender({
                path: ['./app/templates'],
                data: {
                    sponsors,
                    linux64   : `${data.downLink}linux-x64.zip`,
                    linux32   : `${data.downLink}linux-ia32.zip`,
                    darwin    : `${data.downLink}darwin-x64.zip`,
                    webapp    : `${data.releaseLink}${data.release}/webapp.zip`,
                    windows64 : `${data.downLink}win32-x64.zip`,
                    windows32 : `${data.downLink}win32-ia32.zip`,
                },
            }))
            .pipe(gulp.dest('app'))
            .pipe($.connect.reload());
        });
    });
};
