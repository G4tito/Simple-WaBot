const axios = require('axios');

async function download(url, type) {
    try {
        const getAxiosConfig = (url, data) => ({
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
                "X-Requested-With": "XMLHttpRequest",
            },
            url,
            data: new URLSearchParams(Object.entries(data)),
        });

        const Y2mateDownload = async (vid, k, size) => {
            try {
                const { data } = await axios(getAxiosConfig('https://tomp3.cc/api/ajax/convert?hl=en', { vid, k }));
                if (data.status !== 'ok') {
                    throw new Error(data.mess);
                }
                return {
                    quality: data.fquality,
                    size,
                    url: data.dlink,
                };
            } catch (error) {
                throw error;
            }
        };

        const { data } = await axios(getAxiosConfig('https://tomp3.cc/api/ajax/search?hl=en', { query: url, vt: 'downloader' }));
        if (data.status !== 'ok') {
            throw new Error(data.mess);
        }

        const { vid, title, links } = data;
        const downloadLinks = links[type === 'video' ? 'mp4' : 'mp3'];
        const keys = Object.values(downloadLinks);

        const results = await Promise.all(keys.map(item => Y2mateDownload(vid, item.k, item.size)));
        const filteredResults = results.filter(v => type === 'video' ? v.quality !== '3gp' : v.url);

        return {
            status: true,
            result: {
                title,
                thumbnail: `https://i.ytimg.com/vi/${vid}/0.jpg`,
                [type]: filteredResults,
            },
        };
    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = {
    download
};
