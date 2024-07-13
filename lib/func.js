const { jidDecode, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios');
const FileType = require('file-type');

function decodeJid(jid) {
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server || jid).trim();
    } else {
        return jid.trim();
    }
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

module.exports = {
    decodeJid,
    downloadMediaMessage,

    getFile,
    getBuffer
};
