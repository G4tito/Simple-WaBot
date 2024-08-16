const axios = require('axios');
const cheerio = require('cheerio');

async function download(url) {
    try {
        const regex = /post\/([^/?]+)/;
        const match = url.match(regex);
        const id = match ? match[1] : null;

        if (!id) {
            return {
                status: false,
                msg: "Invalid ID"
            };
        }

        const headers = {
            accept: "*/*"
        };

        const { data } = await axios.get(`https://threadster.app/download/${id}`, { headers });
        const $ = cheerio.load(data);
        const media = [];

        $('.download__wrapper .download__items .download_item.active .image_wrapper .image img').each((index, element) => {
            const imageUrl = $(element).attr('src');
            if (imageUrl) {
                media.push({ type: 'image', url: imageUrl });
            }
        });

        $('.download__wrapper .download__items .download_item.active .video_wrapper .video video').each((index, element) => {
            const videoUrl = $(element).attr('src');
            if (videoUrl) {
                media.push({ type: 'video', url: videoUrl });
            }
        });

        return {
            status: true,
            result: { media }
        };

    } catch (e) {
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = { download }