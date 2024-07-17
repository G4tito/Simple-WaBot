const { jidDecode, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { sizeFormatter } = require('human-readable');
const PhoneNumber = require('awesome-phonenumber');
const Jimp = require('jimp');
const moment = require('moment-timezone');
const fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios');
const FileType = require('file-type');

const store = require('./store.js');
const { timeZone } = require('../setting.js');

function decodeJid(jid) {
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server || jid).trim();
    } else {
        return jid.trim();
    }
}

function getTime(type, ms) {
    const time = moment.tz(timeZone);

    if (type === 'hour') {
        return time.format('hh:mm a');
    } else if (type === 'date') {
        return time.format('ddd, D MMM YYYY').replace(/^\w/, (c) => c.toUpperCase());
    }
    return null;
}

function getName(jid) {
    if (jid === '0@s.whatsapp.net') {
        return 'WhatsApp';
    }
      
    for (const chatKey in store.messages) {
        if (store.messages.hasOwnProperty(chatKey)) {
            const usersArray = store.messages[chatKey].array;
            const userMsgs = usersArray.filter(m => m.sender === jid && m?.pushName);
            if (userMsgs.length !== 0) {
                return userMsgs[userMsgs.length - 1].pushName;
            }
        }
    }
    
    return PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
}

async function downloadMediaMessage(media) {
    let type = Object.keys(media)[0];
    let msg = media[type];

    if (!msg || !(msg.url || msg.directPath)) {
        return null;
    }

    let stream = await downloadContentFromMessage(msg, type.replace(/Message/i, ''));
    let buffers = [];

    for await (let chunk of stream) {
        buffers.push(chunk);
    }

    buffers = Buffer.concat(buffers);
    stream.destroy();

    return buffers;
}

async function getFile(PATH) {
    let res = null, filename;
    let buffer = Buffer.isBuffer(PATH)
        ? PATH
        : /^data:.*?\/.*?;base64,/i.test(PATH)
            ? Buffer.from(PATH.split(',')[1], 'base64')
            : /^https?:\/\//.test(PATH)
                ? Buffer.from(res = await getBuffer(PATH), 'binary')
                : fs.existsSync(PATH)
                    ? (filename = PATH, fs.readFileSync(PATH))
                    : typeof PATH === 'string'
                        ? PATH
                        : Buffer.alloc(0);

    if (!Buffer.isBuffer(buffer)) throw new TypeError('Result is not a buffer.');

    let type = await FileType.fromBuffer(buffer) || {
        mime: 'application/octet-stream',
        ext: '.bin'
    };

    return {
        res,
        ...type,
        buffer
    };
}


async function getBuffer(url) {
    try {
        return (await axios.get(url, { responseType: 'arraybuffer' })).data;
    } catch {
        try {
            return await (await fetch(url)).buffer();
        } catch (e) {
            throw new Error(e);
        }
    }
}


function formatSize(size) {
    return sizeFormatter({
        std: 'JEDEC',
        decimalPlaces: 2,
        keepTrailingZeroes: false,
        render: (literal, symbol) => `${literal} ${symbol}B`,
    })(size);
}

async function resizeImage(buffer, resolution) {
    return new Promise(async (resolve, reject) => {
        try {
            const image = await Jimp.read(buffer);
            const { width, height } = image.bitmap;
            const ratio = width / height;
            const optimalWidth = ratio > 1 ? resolution : Math.round(resolution * ratio);
            const optimalHeight = ratio < 1 ? resolution : Math.round(resolution / ratio);
            const resizedBuffer = await image.resize(optimalWidth, optimalHeight).getBufferAsync(Jimp.MIME_JPEG);
            resolve(resizedBuffer);
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    decodeJid,
    
    getTime,
    
    downloadMediaMessage,
    
    getName,
    getFile,
    getBuffer,
    
    formatSize,
    resizeImage
};
