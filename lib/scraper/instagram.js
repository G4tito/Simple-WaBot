const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function download(url) {
    try {
        const res = await fetch('https://v3.igdownloader.app/api/ajaxSearch', {
            method: 'POST',
            body: new URLSearchParams({
                recapthaToken: '',
                q: url,
                t: 'media',
                lang: 'id',
            }),
        });

        const json = await res.json();
        const html = json.data;

        const $ = cheerio.load(html);
        const media = [];

        $('ul li').each((i, el) => {
            const title = $(el).find('a[title]').attr('title');
            const href = $(el).find('a[title]').attr('href');

            media.push({
                type: title.toLowerCase().includes('photo') ? 'photo' : 'video',
                url: href,
            });
        });

        if (media.length === 0) {
            return {
                status: false,
                msg: 'No results found.'
            };
        }

        return {
            status: true,
            result: {
                media
            }
        };

    } catch (e) {
        return { status: false, msg: e.message };
    }
}

module.exports = { download };
