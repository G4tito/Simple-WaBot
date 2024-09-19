const { fromBuffer } = require('file-type');
const fluent = require('fluent-ffmpeg');
const webpmux = require('node-webpmux');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');
const { exec } = require('child_process');

function toWebp(buffer, opts = {}) {
    let { name = '', author = '', emojis = [] } = opts;
    return new Promise(async (resolve, reject) => {
        if (!Buffer.isBuffer(buffer)) return reject('The buffer must be not empty.');
        const { ext } = await fromBuffer(buffer);
        if (/(webp)/i.test(ext)) {
            let wm = await setExif(buffer, { ...opts });
            return resolve(wm);
        }
        if (!/(png|jpg|jpeg|mp4|mkv|m4p|gif)/i.test(ext)) return reject('Buffer not supported media.');
        const input = path.join(global.tempDir, `${Date.now()}.${ext}`);
        const output = path.join(global.tempDir, `${Date.now()}.webp`);
        await fs.writeFileSync(input, buffer);
        let aspectRatio = `scale='if(gt(iw,ih),-1,299):if(gt(iw,ih),299,-1)', crop=299:299:exact=1`;
        if (opts.isFull == true) aspectRatio = `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease`;
        let options;
        switch (ext) {
            case 'png':
            case 'jpeg':
            case 'jpg':
                options = [
                    '-vcodec',
                    'libwebp',
                    '-vf',
                    `${aspectRatio}, fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
                ];
                break;
            case 'mp4':
            case 'mkv':
            case 'm4p':
            case 'gif':
                options = [
                    '-vcodec',
                    'libwebp',
                    '-vf',
                    `${aspectRatio}, fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
                    '-loop',
                    '0',
                    '-ss',
                    '00:00:00',
                    '-t',
                    '00:00:10',
                    '-preset',
                    'default',
                    '-an',
                    '-vsync',
                    '0'
                ];
                break;
        }
        fluent(input)
            .input(input)
            .addOutputOptions(options)
            .toFormat('webp')
            .save(output)
            .on('end', async () => {
                let bufferEnd = fs.readFileSync(output);
                let wm = await setExif(bufferEnd, { ...opts });
                resolve(wm);
                fs.unlinkSync(input);
                fs.unlinkSync(output);
            })
            .on('error', (err) => {
                reject(err);
                fs.unlinkSync(input);
            });
    });
}

function setExif(buffer, opts = {}) {
    let { name = '', author = '', emojis = [], other = {} } = opts;
    return new Promise(async (resolve, reject) => {
        if (!Buffer.isBuffer(buffer)) return reject('The buffer must be not empty.');
        const { ext } = await fromBuffer(buffer);
        if (!/webp/i.test(ext)) return reject('The buffer must be of type webp.');
        const file = path.join(global.tempDir, `${Date.now()}.${ext}`);
        await fs.writeFileSync(file, buffer);
        let exif = new webpmux.Image();
        let dataExif = Buffer.from(
            JSON.stringify({
                'sticker-pack-id': '猫',
                'sticker-pack-name': name,
                'sticker-pack-publisher': author,
                'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp',
                'ios-app-store-link': 'https://itunes.apple.com/app/sticker-maker-studio/id1443326857',
                'emojis': emojis,
                ...other
            }),
            'utf-8'
        );
        let loadDataExif = Buffer.concat([
            Buffer.from([
                0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x16, 0x00, 0x00, 0x00
            ]),
            dataExif
        ]);
        loadDataExif.writeUIntLE(dataExif.length, 14, 4);
        await exif.load(file);
        exif.exif = loadDataExif;
        await exif.save(file);
        let readData = await fs.readFileSync(file);
        resolve(readData);
        fs.unlinkSync(file);
    });
}

function webpToImage(buffer) {
    return new Promise(async (resolve, reject) => {
        if (!Buffer.isBuffer(buffer)) return reject('The buffer must be not empty.');
        const { ext } = await fromBuffer(buffer);
        if (!/(webp)/i.test(ext)) return reject('Buffer not supported media.');
        const input = path.join(global.tempDir, `${Date.now()}.${ext}`);
        const output = path.join(global.tempDir, `${Date.now()}.png`);
        await fs.writeFileSync(input, buffer);
        await exec(`ffmpeg -i ${input} ${output}`, async (err) => {
            fs.unlinkSync(input);
            if (err) return reject(err);
            let bufferEnd = await fs.readFileSync(output);
            resolve(bufferEnd);
            fs.unlinkSync(output);
        });
    });
}

function webpToVideo(buffer) {
    return new Promise(async (resolve, reject) => {
        if (!Buffer.isBuffer(buffer)) return reject('The buffer must be not empty.');
        const { ext } = await fromBuffer(buffer);
        if (!/(webp)/i.test(ext)) return reject('Buffer not supported media.');
        const input = path.join(global.tempDir, `${Date.now()}.${ext}`);
        const gif = path.join(global.tempDir, `${Date.now()}.gif`);
        const output = path.join(global.tempDir, `${Date.now()}.mp4`);
        await fs.writeFileSync(input, buffer);
        await exec(`convert ${input} ${gif}`, async (err) => {
            if (err) {
                fs.unlinkSync(input);
                return reject(err);
            }
            await exec(`ffmpeg -i ${gif} -pix_fmt yuv420p -c:v libx264 -movflags +faststart -filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2' ${output}`, async (err) => {
                if (err) {
                    fs.unlinkSync(input);
                    fs.unlinkSync(gif);
                    return reject(err);
                }
                let buff = await fs.readFileSync(output);
                resolve(buff);
                fs.unlinkSync(input);
                fs.unlinkSync(gif);
                fs.unlinkSync(output);
            });
        });
    });
}

module.exports = {
    toWebp,
    setExif,
    webpToVideo,
    webpToImage,
};
