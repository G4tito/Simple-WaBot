const { decodeJid } = require('./func.js');

const serialize = (msg, sock) => {
    if (msg.message) {
        msg.id = msg.key.id;
        msg.from = msg.key.remoteJid;
        msg.type = Object.keys(msg.message).find(
            (type) =>
                type !== "senderKeyDistributionMessage" &&
                type !== "messageContextInfo"
        );
        msg.sender = decodeJid(
            msg.key?.fromMe && sock?.user.id ||
            msg.participant ||
            msg.key.participant ||
            msg.from ||
            ""
        );
        msg.text = msg.message.conversation
            ? msg.message.conversation
            : msg.message.extendedTextMessage
            ? msg.message.extendedTextMessage.text
            : msg.message.imageMessage
            ? msg.message.imageMessage.caption
            : msg.message.videoMessage
            ? msg.message.videoMessage.caption
            : msg.message.documentMessage
            ? msg.message.documentMessage.caption
            : "";
        msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
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
                type !== "senderKeyDistributionMessage" &&
                type !== "messageContextInfo"
        );
        msg.quoted.sender = msg.quoted.key.participant;
        msg.quoted.text = msg.quoted.message.conversation
            ? msg.quoted.message.conversation
            : msg.quoted.message.extendedTextMessage
            ? msg.quoted.message.extendedTextMessage.text
            : msg.quoted.message.imageMessage
            ? msg.quoted.message.imageMessage.caption
            : msg.quoted.message.videoMessage
            ? msg.quoted.message.videoMessage.caption
            : msg.quoted.message.documentMessage
            ? msg.quoted.message.documentMessage.caption
            : "";
        msg.quoted.mentions = msg.quoted.message[msg.quoted.type]?.contextInfo?.mentionedJid || [];
    } else {
        msg.quoted = false;
    }
    
    msg.reply = (text, opts = {}) => {
        return sock.sendMessage(msg.from, { text, ...opts }, { quoted: msg });
    }
    
    return msg;
};

module.exports = serialize;
