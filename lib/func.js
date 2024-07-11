const { jidDecode } = require('@whiskeysockets/baileys');

function decodeJid(jid) {
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server || jid).trim();
    } else {
        return jid.trim();
    }
}

module.exports = { decodeJid };
