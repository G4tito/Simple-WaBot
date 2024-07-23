const axios = require('axios');
const cheerio = require('cheerio');

async function download(url) {
    try {
        const { data } = await axios.post(
            'https://getmyfb.com/process',
            new URLSearchParams({
                id: decodeURIComponent(url),
                locale: 'en',
            }),
            {
                headers: {
                    'hx-current-url': 'https://getmyfb.com/',
                    'hx-request': 'true',
                    'hx-target': url.includes('share') ? '#private-video-downloader' : '#target',
                    'hx-trigger': 'form',
                    'hx-post': '/process',
                    'hx-swap': 'innerHTML',
                }
            }
        );

        const $ = cheerio.load(data);

        const title = $('.results-item-text').text().trim() || '';
        const media = $('.results-list-item').map((i, el) => {
            const text = $(el).text().trim();
            return {
                quality: parseInt(text) || '',
                type: text.includes('HD') ? 'HD' : 'SD',
                url: $(el).find('a').attr('href') || '',
            };
        }).get();

        if (media.length === 0) {
            return {
                status: false,
                msg: 'No results found.'
            };
        }

        return {
            status: true,
            result: {
                title,
                media
            }
        };

    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = { download };
