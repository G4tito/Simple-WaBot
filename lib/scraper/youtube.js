const yts = require('yt-search');
const axios = require('axios');

const download = {
    V1: async function youtube(url, opts) {
        const { type = 'video', quality = 360 } = opts;
        const format = type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : null;

        if (!format) {
            return {
                status: false,
                msg: 'Invalid type specified.'
            };
        }

        const baseUrl = 'https://id-y2mate.com';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'Cookie': '_gid=GA1.2.2055666962.1683248123; _gat_gtag_UA_84863187_21=1; _ga_K8CD7CY0TZ=GS1.1.1683248122.1.1.1683249010.0.0.0; _ga=GA1.1.1570308475.1683248122'
        };

        async function request(endpoint, data, extraHeaders = {}) {
            try {
                const response = await axios.post(`${baseUrl}${endpoint}`, new URLSearchParams(data), {
                    headers: { ...headers, ...extraHeaders }
                });
                return response.data;
            } catch (error) {
                return {
                    status: false,
                    msg: error.message
                };
            }
        }

        async function search(url) {
            return request('/mates/analyzeV2/ajax', {
                k_query: url,
                k_page: 'home',
                hl: '',
                q_auto: '0'
            });
        }

        async function convert(vid, key) {
            return request('/mates/convertV2/index', {
                vid,
                k: key
            }, {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
                'Referer': `${baseUrl}/youtube/${vid}`
            });
        }

        const { links, vid, title } = await search(url);

        if (!links || !links[format]) {
            return {
                status: false,
                msg: 'No results found.'
            };
        }

        const getQuality = Object.values(links[format]).find(item => parseInt(item.q) === quality && item.f === format);

        if (!getQuality) {
            return {
                status: false,
                msg: 'No matching quality found.'
            };
        }

        const { fquality, dlink } = await convert(vid, getQuality.k);

        if (!dlink) {
            return {
                status: false,
                msg: 'No download link found.'
            };
        }

        return {
            status: true,
            result: {
                title,
                [type]: {
                    quality: parseInt(fquality),
                    url: dlink
                }
            }
        };
    }
};

async function search(query) {
    try {
        const getData = await yts(query);
        if (getData.videos.length > 0) {
            return {
                status: true,
                result: getData.videos
            };
        } else {
            return {
                status: false,
                msg: 'No results found.'
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

async function play(query) {
    try {
        const getData = await yts(query);
        if (getData.videos.length > 0) {
            return {
                status: true,
                result: getData.videos[0]
            };
        } else {
            return {
                status: false,
                msg: 'No results found.'
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: false,
            msg: e.message
        };
    }
}

module.exports = { download, search, play };