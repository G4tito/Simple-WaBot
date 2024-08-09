const { readFileSync, createWriteStream, unlink } = require('fs');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const axios = require('axios');

const download = {
    V1: async function V1(url, type = 'video') {
        try {
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const extension = type === 'audio' ? 'mp3' : type === 'video' ? 'mp4' : null;

            if (!extension) {
                return { status: false, msg: 'Invalid type. Type must be "audio" or "video".' };
            }

            const filePath = path.resolve(global.tempDir, `Download-${Date.now()}-YouTube.${extension}`);
            const streamOptions = type === 'audio' 
                ? { filter: 'audioonly', quality: 'highestaudio' }
                : { filter: 'audioandvideo', quality: 'highestvideo' };

            const stream = ytdl(url, streamOptions);
            const fileStream = createWriteStream(filePath);
            stream.pipe(fileStream);

            await new Promise((resolve, reject) => {
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });

            const buffer = readFileSync(filePath);

            await new Promise((resolve, reject) => {
                unlink(filePath, err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return {
                status: true,
                result: {
                    title,
                    size: buffer.byteLength,
                    buffer
                }
            };
        } catch (e) {
            console.error(e);
            return {
                status: false,
                msg: e.message
            };
        }
    },

    V2: async function V2(url, type = 'video') {
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
                        return {
                            status: false,
                            msg: data.mess
                        };
                    }
                    return {
                        quality: data.fquality,
                        size,
                        url: data.dlink,
                    };
                } catch (e) {
                    return {
                        status: false,
                        msg: e.message
                    };
                }
            };

            const { data } = await axios(getAxiosConfig('https://tomp3.cc/api/ajax/search?hl=en', { query: url, vt: 'downloader' }));
            if (data.status !== 'ok') {
                return {
                    status: false,
                    msg: data.mess
                };
            }

            const { vid, title, links } = data;
            const downloadLinks = links[type === 'video' ? 'mp4' : 'mp3'];
            const keys = Object.values(downloadLinks);

            const results = [];
            for (const item of keys) {
                const data = await Y2mateDownload(vid, item.k, item.size);
                results.push(data);
            }
            const filteredResults = results.filter(v => 
                (type === 'video' ? v.quality !== '3gp' : v.url) && v.url
            );

            if (filteredResults.length === 0) {
                return {
                    status: false,
                    msg: 'No results found.'
                };
            }

            return {
                status: true,
                result: {
                    title,
                    thumb: `https://i.ytimg.com/vi/${vid}/0.jpg`,
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
    },
    V3: async function V3(url, type = 'video') {
        const baseUrl = 'https://id-y2mate.com';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': '*/*',
            'X-Requested-With': 'XMLHttpRequest'
        };

        async function request(endpoint, data, extraHeaders = {}) {
            try {
                const response = await axios.post(`${baseUrl}${endpoint}`, new URLSearchParams(data), { headers: { ...headers, ...extraHeaders } });
                return response.data;
            } catch (e) {
                return {
                    status: true,
                    msg: e.message
                };
            }
        }

        const search = (url) => request('/mates/analyzeV2/ajax', { k_query: url, k_page: 'home', hl: '', q_auto: '0' });

        const convert = (vid, key) => request('/mates/convertV2/index', { vid, k: key }, { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36', 'Referer': `${baseUrl}/youtube/${vid}` });

        async function processLinks(links, vid, format) {
            const result = [];
            for (const input of Object.values(links)) {
                if (input.f === format) {
                    const { fquality, dlink } = await convert(vid, input.k);
                    result.push({ quality: fquality, url: dlink });
                }
            }
            return result;
        }

        const { links, vid, title } = await search(url);
        const media = type === 'video' ? await processLinks(links.mp4, vid, 'mp4') : type === 'audio' ? await processLinks(links.mp3, vid, 'mp3') : null;
        if (!media) return {
            status: true,
            msg: 'Invalid type specified.'
        };
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
                [type]: media
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