const { decodeJid, downloadMediaMessage, getFile } = require('./func.js');
const db = require('./database.js');

const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];

const serialize = (msg, sock) => {
    if (msg.message) {
        msg.id = msg.key.id;
        msg.from = msg.key.remoteJid;
        msg.type = Object.keys(msg.message).find(type =>
            type !== 'senderKeyDistributionMessage' &&
            type !== 'messageContextInfo'
        );
        msg.sender = decodeJid(
            msg.key?.fromMe && sock?.user.id ||
            msg.participant ||
            msg.key.participant ||
            msg.from ||
            ''
        );

        let message = msg.message;
        if (msg.type === 'viewOnceMessageV2' || msg.type === 'interactiveMessage' || msg.type === 'documentWithCaptionMessage') {
            message = msg.message[msg.type]?.header || msg.message[msg.type].message;
            msg.typeV2 = Object.keys(message)[0];
        }

        msg.text = message?.conversation ||
            message[msg.type]?.text ||
            message[msg.type]?.caption ||
            message[msg?.typeV2]?.caption ||
            message[msg.type]?.selectedId ||
            message[msg.type]?.name ||
            message[msg?.typeV2]?.body?.text ||
            (msg.type === 'stickerMessage' ?
                db.stickers.get(Buffer.from(message[msg.type].fileSha256).toString('base64'))?.command :
                '') ||
            '';

        msg.mentions = (message[msg.typeV2] || message[msg.type])?.contextInfo?.mentionedJid || [];
        msg.expiration = (message[msg.typeV2] || message[msg.type])?.contextInfo?.expiration || 0;

        let isMedia = MediaType.some(type => {
            let m = message[type];
            return m?.url || m?.directPath;
        });

        if (isMedia) {
            msg.media = message[msg.typeV2] || message[msg.type] || null;
            msg.download = () => downloadMediaMessage(message);
        }
    }

    if (!msg.quoted) msg.quoted = {};
    msg.quoted.message = msg.message[msg.type]?.contextInfo?.quotedMessage || null;

    if (msg.quoted.message) {
        msg.quoted.key = {
            remoteJid: msg.message[msg.type]?.contextInfo?.remoteJid || msg.from || msg.sender,
            fromMe: decodeJid(msg.message[msg.type]?.contextInfo?.participant) === sock.user.jid,
            id: msg.message[msg.type]?.contextInfo?.stanzaId,
            participant: decodeJid(msg.message[msg.type]?.contextInfo?.participant) || msg.sender
        };

        msg.quoted.id = msg.quoted.key.id;
        msg.quoted.from = msg.quoted.key.remoteJid;
        msg.quoted.type = Object.keys(msg.quoted.message).find(type =>
            type !== 'senderKeyDistributionMessage' &&
            type !== 'messageContextInfo'
        );
        
        msg.quoted.sender = msg.quoted.key.participant;

        if (msg.quoted) {
            let message = msg.quoted.message;
            if (msg.quoted.type === 'viewOnceMessageV2' || msg.quoted.type === 'interactiveMessage' || msg.quoted.type === 'documentWithCaptionMessage') {
                message = msg.quoted.message[msg.quoted.type]?.header || msg.quoted.message[msg.quoted.type].message;
                msg.quoted.typeV2 = Object.keys(message)[0];
            }

            msg.quoted.text = message?.conversation ||
                message[msg.quoted.type]?.text ||
                message[msg.quoted.type]?.caption ||
                message[msg.quoted.typeV2]?.caption ||
                message[msg.quoted.type]?.selectedId ||
                message[msg.quoted.type]?.name ||
                message[msg.quoted.typeV2]?.body?.text ||
                '';

            msg.mentions = (message[msg.quoted.typeV2] || message[msg.quoted.type])?.contextInfo?.mentionedJid || [];

            let isMedia = MediaType.some(type => {
                let m = message[type];
                return m?.url || m?.directPath;
            });

            if (isMedia) {
                msg.quoted.media = message[msg.quoted.typeV2] || message[msg.quoted.type] || null;
                msg.quoted.download = () => downloadMediaMessage(message);
            }
        }
    } else {
        msg.quoted = false;
    }

    msg.reply = async (text, opts = {}) => {
        let from = opts.from || msg.from;
        let quoted = opts.quoted !== undefined ? opts.quoted : msg;

        if (opts.mentions) {
            opts.mentions = Array.isArray(opts.mentions) ? opts.mentions : [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
        }

        let messageId = null, expiration = null, content;
        if (msg.expiration) {
            expiration = { ephemeralExpiration: opts.expiration || msg.expiration };
            if (opts.expiration) delete opts.expiration;
        }

        if (opts.image || opts.video || opts.document || opts.sticker || opts.audio) {
            let mediaType = Object.keys(opts).find(key => ['image', 'video', 'document', 'sticker', 'audio'].includes(key));
            content = { caption: text, ...opts, [mediaType]: (await getFile(opts[mediaType])).buffer };
        } else if (opts.delete || opts.forward) {
            content = { ...opts };
        } else {
            content = { text, ...opts };
        }

        if (opts.id) messageId = opts.id;

        return sock.sendMessage(from, content, { quoted, ...expiration, messageId });
    };

    msg.react = (emoji, opts = {}) => {
        let key = opts.key || msg.key;
        return sock.sendMessage(msg.from, { react: { text: emoji, key } });
    };

    return msg;
};

module.exports = serialize;
