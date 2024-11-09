const { decodeJid } = require('../../lib/func.js');

exports.cmd = {
    name: ['everyone'],
    command: ['everyone', 'notify'],
    category: ['moderation'],
    detail: {
        desc: 'Etiqueta a todos con el mensaje ingresado.',
        use: 'text'
    },
    setting: {
        isAdmin: true
    },
    async start({ msg, text, participants }) {
        const q = msg.quoted || msg;
        const media = q.media ? await q.download() : false;
        const teks = msg.quoted ? q.text : text;

        if (!(media || teks)) {
            return msg.reply('*🚩 Ingresa un texto para etiquetar a todos.*');
        }

        const users = participants.map(u => decodeJid(u.id));

        await msg.reply(teks, { 
            media, 
            contextInfo: { 
                mentionedJid: users,
                remoteJid: msg.from
            }, 
            quoted: false 
        });
    }
};