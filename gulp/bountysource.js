'use strict';

const _     = require('underscore');
const logos = require('./sponsors');

function onLoad($, res) {
    let sponsors = [];

    res.body.forEach(sp => {
        if (!sp.id) {
            $.util.log('sponsor has no id', sp);
            return;
        }

        const sponsor  = _.extend(logos[sp.slug] || {}, sp, {
            image  : sp.image_url_small,
            amount : sp.alltime_amount,
        });

        // Use Bountysource profile link
        const now    = new Date(sponsor);
        const spDate = new Date();

        // Old sponsor
        if (now.getFullYear() !== spDate.getFullYear() ||
            now.getMonth() !== spDate.getMonth()) {
            return;
        }

        if (sponsor.amount < 5 || !sponsor.url) {
            sponsor.url = `https://www.bountysource.com/people/${sponsor.slug}`;
        }
        if (sponsor.amount < 50 && sponsor.logo) {
            sponsor.logo = null;
        }

        sponsors.push(sponsor);
    });

    sponsors = _.sortBy(sponsors, 'amount').reverse();
    return sponsors;
}

/**
 * Load list of sponsors from Bountysource.
 */
module.exports.getSponsors = (gulp, $) => {
    const defer = $.Q.defer();

    $.request
    .get('https://api.bountysource.com/supporters')
    .query({per_page: 10000})
    .query({page: 1})
    .query({include_author: true})
    .query({team_slug: 'laverna'})
    .set({Accept: 'application/vnd.bountysource+json; version=2'})
    .end((err, res) => {
        if (err) {
            $.util.log('Failed', err.status);
            return;
        }

        defer.resolve(onLoad($, res));
    });

    return defer.promise;
};
