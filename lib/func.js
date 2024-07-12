const { jidDecode, downloadContentFromMessage } = require('@whiskeysockets/baileys');

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

module.exports = { decodeJid, downloadMediaMessage };
