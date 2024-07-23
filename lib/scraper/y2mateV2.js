const axios = require('axios');

const baseUrl = 'https://id-y2mate.com';

const search = async (url) => {
    const requestData = new URLSearchParams({
        k_query: url,
        k_page: 'home',
        hl: '',
        q_auto: '0'
    });

    const requestHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
    };

    try {
        const response = await axios.post(`${baseUrl}/mates/analyzeV2/ajax`, requestData, { headers: requestHeaders });
        return response.data;
    } catch (e) {
        throw new Error(e.message);
    }
};

const convert = async (videoId, key) => {
    const requestData = new URLSearchParams({
        vid: videoId,
        k: key
    });

    const requestHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Referer': `${baseUrl}/youtube/${videoId}`
    };

    try {
        const response = await axios.post(`${baseUrl}/mates/convertV2/index`, requestData, { headers: requestHeaders });
        return response.data;
    } catch (e) {
        throw new Error(e.message);
    }
};

const download = async (url, type) => {
    try {
        const { links, vid, title } = await search(url);
        const results = { video: [], audio: [] };

        const processLinks = async (linkType) => {
            const linkEntries = Object.entries(links[linkType] || {});
            for (const [key, { k, q }] of linkEntries) {
                const { fquality, dlink } = await convert(vid, k);
                results[linkType].push({
                    quality: fquality,
                    size: q,
                    url: dlink
                });
            }
        };

        if (type === 'video' && links.mp4) await processLinks('video');
        if (type === 'audio' && links.mp3) await processLinks('audio');

        return {
            status: true,
            result: {
                title,
                thumbnail: `https://i.ytimg.com/vi/${vid}/0.jpg`,
                [type]: results[type] || []
            }
        };
    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
};

module.exports = {
    download
};
