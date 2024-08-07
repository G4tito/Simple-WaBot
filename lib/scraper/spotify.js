const cheerio = require('cheerio');
const axios = require('axios');
const FormData = require('form-data');

async function download(url) {
    try {
        const response = await axios.get('https://spotifymate.com/en', {
            headers: {
                cookie: 'session_data=o8079end5j9oslm5a7bou84rqc;',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);
        const hiddenInput = $('form#get_video input[type="hidden"]');
        const formData = new FormData();
        formData.append('url', url);
        formData.append(hiddenInput.attr('name') || '', hiddenInput.attr('value') || '');

        const postResponse = await axios.post('https://spotifymate.com/action', formData, {
            headers: {
                origin: 'https://spotifymate.com/en',
                ...formData.getHeaders(),
                cookie: 'session_data=o8079end5j9oslm5a7bou84rqc;',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
            },
        });

        if (postResponse.statusText !== 'OK') {
            return {
                status: false,
                msg: 'Fail Fetching.'
            };
        }

        const $post = cheerio.load(postResponse.data);
        const result = {
            title: $post('.dlvideos').find('h3[itemprop="name"]').text().trim(),
            author: $post('.dlvideos').find('.spotifymate-downloader-middle > p > span').text().trim(),
            thumb: $post('.dlvideos').find('img').attr('src') || '',
            music: $post('.dlvideos').find('.spotifymate-downloader-right #none').eq(0).find('a').attr('href') ||
                   $post('.dlvideos').find('.spotifymate-downloader-right #pop').eq(0).find('a').attr('href') || ''
        };
        if (result.music === '') {
            return {
                status: false,
                msg: 'No results found.'
            };
        }
        return {
            status: true,
            result
        };
    } catch (e) {
        console.error(e)
        return {
            status: false,
            msg: e.message
        }
    }
}

module.exports = { download };

