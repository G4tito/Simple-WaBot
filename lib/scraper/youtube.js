const { readFileSync, createWriteStream, unlink } = require('fs');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const path = require('path');

async function download(url, type = 'audio') {
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
}

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
