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