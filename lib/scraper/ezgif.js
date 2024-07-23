const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const { getBuffer } = require('../func.js');

async function webpToVideo(str) {
    try {
        const image = Buffer.isBuffer(str) ? str : str.startsWith('http') ? await getBuffer(str) : str;
        const form = new FormData();
        form.append('new-image', image, 'image.webp');
        
        const { data: html } = await axios.post('https://ezgif.com/webp-to-mp4', form, {
            headers: {
                ...form.getHeaders(),
                "Accept": "*/*",
                "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                "Origin": "https://ezgif.com",
                "Referer": "https://ezgif.com/webp-to-mp4",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        });

        const $ = cheerio.load(html);
        const fileInputValue = $('#main > form input[type=hidden]').first().val();
        const { data: proc } = await axios.post(`https://ezgif.com/webp-to-mp4/${fileInputValue}`, new URLSearchParams({ file: fileInputValue }), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                "Origin": "https://ezgif.com",
                "Referer": "https://ezgif.com/webp-to-mp4",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const proc$ = cheerio.load(proc);
        const videoSrc = proc$('#output > p.outfile video > source').attr('src');

        if (!videoSrc) {
            return {
                status: false,
                msg: 'Failed to convert.'
            };
        }

        return {
            status: true,
            result: {
                url: 'https:' + videoSrc
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

module.exports = { webpToVideo };
