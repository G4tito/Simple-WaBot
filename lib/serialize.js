const { decodeJid, downloadMediaMessage, getFile } = require('./func.js');

const serialize = (msg, sock) => {
    if (msg.message) {
        msg.id = msg.key.id;
        msg.from = msg.key.remoteJid;
        msg.type = Object.keys(msg.message).find(
            (type) =>
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
        let message = msg.type === 'viewOnceMessageV2' ? 
            msg.message[msg.type].message : 
            msg.type === 'interactiveMessage' ? 
            msg.message[msg.type].header : 
            msg.type === 'documentWithCaptionMessage' ? 
            msg.message[msg.type].message :
            msg.message;
        msg.text = message?.conversation || 
            message[msg.type]?.text || 
            message[msg.type]?.caption || 
            (message?.imageMessage || message?.videoMessage || message?.documentMessage)?.caption || 
            message[msg.type]?.selectedId || 
            msg.quoted?.message[msg.type]?.body?.text || 
            '';
        msg.mentions = message[msg.type]?.contextInfo?.mentionedJid || (message?.documentMessage || message?.imageMessage || message?.videoMessage)?.contextInfo?.mentionedJid || [];
        msg.expiration = message[msg.type]?.contextInfo?.expiration || (message?.documentMessage || message?.imageMessage || message?.videoMessage)?.contextInfo?.expiration || 0;
        
        msg.download = () => {
            return downloadMediaMessage(message);
        }
    }
    
    if (!msg.quoted) msg.quoted = {};
    msg.quoted.message = msg.message[msg.type]?.contextInfo?.quotedMessage
        ? msg.message[msg.type].contextInfo.quotedMessage
        : null;
    if (msg.quoted.message) {
        msg.quoted.key = {
            remoteJid: msg.message[msg.type]?.contextInfo?.remoteJid || msg.from || msg.sender,
            fromMe: decodeJid(msg.message[msg.type].contextInfo.participant) === decodeJid(sock.user.id),
            id: msg.message[msg.type].contextInfo.stanzaId,
            participant: decodeJid(msg.message[msg.type]?.contextInfo?.participant) || msg.sender
        };
        msg.quoted.id = msg.quoted.key.id;
        msg.quoted.from = msg.quoted.key.remoteJid;
        msg.quoted.type = Object.keys(msg.quoted.message).find(
            (type) =>
                type !== 'senderKeyDistributionMessage' &&
                type !== 'messageContextInfo'
        );
        msg.quoted.sender = msg.quoted.key.participant;
        let message = msg.quoted.type === 'viewOnceMessageV2' ? 
            msg.quoted.message[msg.quoted.type].message : 
            msg.quoted.type === 'interactiveMessage' ? 
            msg.quoted.message[msg.quoted.type].header : 
            msg.quoted.type === 'documentWithCaptionMessage' ? 
            msg.quoted.message[msg.quoted.type].message :
            msg.quoted.message;
        msg.quoted.text = message?.conversation || 
            message[msg.quoted.type]?.text || 
            message[msg.quoted.type]?.caption || 
            (message?.imageMessage || message?.videoMessage || message?.documentMessage)?.caption || 
            message[msg.quoted.type]?.selectedId || 
            msg.quoted?.message[msg.quoted.type]?.body?.text || 
            '';
        msg.quoted.mentions = message[msg.quoted.type]?.contextInfo?.mentionedJid || (message?.documentMessage || message?.imageMessage || message?.videoMessage)?.contextInfo?.mentionedJid || [];
        
        msg.quoted.download = () => {
            return downloadMediaMessage(message);
        }
    } else {
        msg.quoted = false;
    }
    
    msg.reply = async (text, opts = {}) => {
        let from = opts.from ? opts.from : msg.from;
        let quoted = opts.quoted !== undefined ? opts.quoted : msg;

        if (opts.mentions) {
            opts.mentions = Array.isArray(opts.mentions) ? opts.mentions : [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
        }

        let messageId = null, expiration = null, content;
        if (msg.expiration) {
            expiration = { ephemeralExpiration: opts.expiration ? opts.expiration : msg.expiration };
            if (opts.expiration) delete opts.expiration;
        }
    
        if (opts.image || opts.video || opts.document || opts.sticker || opts.audio) {
            let mediaType = Object.keys(opts).find(key => ['image', 'video', 'document', 'sticker', 'audio'].includes(key));
            content = { caption: text, [mediaType]: (await getFile(opts[mediaType])).buffer };
        } else if (opts.delete || opts.forward) {
            content = { ...opts };
        } else {
            content = { text, ...opts };
        }

        if (opts.id) messageId = opts.id;

        return sock.sendMessage(from, content, { quoted, ...expiration, messageId });
    }
    
    msg.react = (emoji, opts = {}) => {
        let key = opts.key ? opts.key : msg.key;
        return sock.sendMessage(msg.from, { react: { text: emoji, key }});
    }
    
    return msg;
};

module.exports = serialize;
