const { readFileSync, createWriteStream, unlink } = require('fs');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const path = require('path');

async function download(url, type = 'audio') {
    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;
        const extension = type === 'audio' ? 'mp3' : type === 'video' ? 'mp4' : false;
        
        if (!extension) {
            return { status: false, message: 'Invalid type. Type must be "audio" or "video".' };
        }

        const filePath = path.resolve(global.tempDir, `${title}.${extension}`);

        const streamOptions = type === 'audio' 
            ? { filter: 'audioonly', quality: 'highestaudio' }
            : { filter: 'audioandvideo', quality: 'highestvideo' };

        const stream = ytdl(url, streamOptions);

        return new Promise((resolve, reject) => {
            const fileStream = createWriteStream(filePath);
            stream.pipe(fileStream);
            fileStream.on('finish', () => {
                try {
                    const buffer = readFileSync(filePath);
                    unlink(filePath, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                status: true,
                                result: {
                                    title,
                                    size: buffer.byteLength,
                                    buffer
                                }
                            });
                        }
                    });
                } catch (readError) {
                    reject(readError);
                }
            });
            fileStream.on('error', reject);
        });
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }
}

function search(query) {
    return new Promise((resolve, reject) => {
        yts(query)
            .then(async (getData) => {
                if (getData.videos.length > 0) {
                    let result = {
                        status: true,
                        result: getData.videos
                    };
                    resolve(result);
                } else {
                    let result = {
                        status: false,
                        message: 'No results found.'
                    };
                    resolve(result);
                }
            })
            .catch(reject);
    });
}

function play(query) {
    return new Promise((resolve, reject) => {
        yts(query)
            .then(async (getData) => {
                if (getData.videos.length > 0) {
                    let result = {
                        status: true,
                        result: getData.videos[0]
                    };
                    resolve(result);
                } else {
                    let result = {
                        status: false,
                        message: 'No results found.'
                    };
                    resolve(result);
                }
            })
            .catch(reject);
    });
}

module.exports = { download, search, play };
