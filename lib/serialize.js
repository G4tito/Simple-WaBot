const { decodeJid, downloadMediaMessage, getFile } = require('./func.js');

const MediaType = [
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'stickerMessage',
    'documentMessage',
    'ptvMessage'
];

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
        if (['viewOnceMessageV2', 'interactiveMessage', 'documentWithCaptionMessage'].includes(msg.type)) {
            message = msg.message[msg.type]?.header || msg.message[msg.type]?.message || false;
            if (message) msg.typeV2 = Object.keys(message)[0];
        }

        msg.text = message?.conversation ||
            message[msg.type]?.text ||
            message[msg.type]?.caption ||
            message[msg?.typeV2]?.caption ||
            message[msg.type]?.selectedId ||
            message[msg.type]?.name ||
            msg.message[msg.type]?.body?.text ||
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
            if (['viewOnceMessageV2', 'interactiveMessage', 'documentWithCaptionMessage'].includes(msg.quoted.type)) {
                message = msg.quoted.message[msg.quoted.type]?.header || msg.quoted.message[msg.quoted.type]?.message || false;
                if (message) msg.quoted.typeV2 = Object.keys(message)[0];
            }

            msg.quoted.text = message?.conversation ||
                message[msg.quoted.type]?.text ||
                message[msg.quoted.type]?.caption ||
                message[msg.quoted.typeV2]?.caption ||
                message[msg.quoted.type]?.selectedId ||
                message[msg.quoted.type]?.name ||
                msg.quoted.message[msg.quoted.type]?.body?.text ||
                '';

            msg.quoted.mentions = (message[msg.quoted.typeV2] || message[msg.quoted.type])?.contextInfo?.mentionedJid || [];

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

    msg.reply = async (textOrOpts, opts = {}) => {
        let text = null;
        let options = {};

        if (textOrOpts === null) {
            options = opts;
        } else if (typeof textOrOpts === 'string') {
            text = textOrOpts;
            options = opts;
        } else {
            options = textOrOpts;
            text = options?.text || null;
        }

        let from = options?.from || msg.from;
        let quoted = options?.quoted !== undefined ? options.quoted : msg;

        if (options?.mentions) {
            options.mentions = Array.isArray(options.mentions)
                ? options.mentions
                : [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
        }

        let messageId = null, expiration = null, content;
        if (msg.expiration) {
            expiration = { ephemeralExpiration: options?.expiration || msg.expiration };
            if (options?.expiration) delete options.expiration;
        }
        if (options?.media) {
            const { mime, buffer } = await getFile(options.media);

            let mtype = '';
            if (/webp/.test(mime)) mtype = 'sticker';
            else if (/image/.test(mime)) mtype = 'image';
            else if (/video/.test(mime)) mtype = (Buffer.byteLength(buffer) >= 104857600 ? 'document' : 'video');
            else if (/audio/.test(mime)) mtype = 'audio';
            else mtype = 'document';

            delete options.media;
            content = { [mtype]: buffer, caption: text, mimetype: mime, ...options };
        } else if (options?.image || options?.video || options?.document || options?.sticker || options?.audio) {
            let mediaType = Object.keys(options).find(key => ['image', 'video', 'document', 'sticker', 'audio'].includes(key));
            content = { caption: text, ...options, [mediaType]: (await getFile(options[mediaType])).buffer };
        } else if (options?.delete || options?.forward) {
            content = { ...options };
        } else {
            content = { ...(text && { text }), ...options };
        }

        if (options?.id) messageId = options.id;

        return sock.sendMessage(from, content, { quoted, ...expiration, messageId });
    };

    msg.react = (emoji, opts = {}) => {
        let key = opts.key || msg.key;
        return sock.sendMessage(msg.from, { react: { text: emoji, key } });
    };

    return msg;
};

module.exports = serialize;