const { decodeJid } = require('../../lib/func.js');

exports.cmd = {
    name: ['everyone'],
    command: ['everyone'],
    category: ['moderation'],
    detail: {
        desc: 'Etiqueta a todos con el mensaje ingresado.',
        use: 'text'
    },
    setting: {
        isAdmin: true
    },
    async start({ msg, text, participants }) {
        if (!text) return msg.reply(`*🚩 Ingresa un texto para etiquetar a todos.*`);
        
        let q = msg.quoted ? msg.quoted : msg;
        let media = q.media ? await q.download() : false;
        let users = participants.map(u => decodeJid(u.id));
        
        await msg.reply(text, { 
            media, 
            contextInfo: { 
                mentionedJid: users, 
                remoteJid: msg.from 
            }, 
            quoted: false 
        });
    }
}
