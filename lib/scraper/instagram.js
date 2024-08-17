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

        $('div.download-items').each((i, el) => {
            const videoUrl = $(el).find('a[title="Download Video"]').attr('href');
            const photoUrl = $(el).find('a[title="Download Photo"]').attr('href');

            if (videoUrl) {
                media.push({
                    type: 'video',
                    url: videoUrl
                });
            } else if (photoUrl) {
                media.push({
                    type: 'photo',
                    url: photoUrl
                });
            }
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
