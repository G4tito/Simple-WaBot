const yts = require('yt-search');
const axios = require('axios');
const cheerio = require('cheerio');

const download = {
    V1: async function dl(url, opts = {}) {
        const { type = 'video', quality = 360 } = opts;
        const format = type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : null;

        if (!format) {
            return { status: false, msg: 'Invalid type specified.' };
        }

        const headers = {
            "accept": "*/*",
            "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
            "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "Referer": "https://downloaderto.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };

        try {
            const res = await fetch(`https://ab.cococococ.com/ajax/download.php?copyright=0&format=${type === 'audio' ? 'mp3' : quality}&url=${url}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`, {
                headers
            });

            const data = await res.json();

            const maxAttempts = 10;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const progressRes = await fetch(`https://p.oceansaver.in/ajax/progress.php?id=${data.id}`, {
                    headers
                });

                const progressData = await progressRes.json();
                console.log(progressData);

                if (progressData.download_url) {
                    return {
                        status: true,
                        result: {
                           title: data.title,
                          [type]: {
                                quality: parseInt(quality, 10),
                              url: progressData.download_url
                            }
                        }
                    };
                }

                if ((progressData?.text || '').startsWith('No Files')) {
                    return { status: false, msg: 'An error occurred during the download process.' };
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            return { status: false, msg: 'Download did not complete within the expected time.' };

        } catch (e) {
            console.error(e);
            return { status: false, msg: e.message };
        }
    },
    V2: async function dl(url, opts) {
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