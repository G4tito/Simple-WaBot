const { uploadToTelegraph } = require('../../lib/sticker.js');

exports.cmd = {
    name: ['setcover'],
    command: ['setcover', 'setthumb'],
    category: ['setting'],
    detail: {
        desc: 'Cambia la miniatura del menú del bot.',
        use: 'img'
    },
    setting: {
        isOwner: true
    },
    async start({ msg, sock, args, db }) {
        let setting = db.settings.get(sock.user.jid);

        if (args[0] === '--default') {
            setting.cover = '';
            return msg.reply('*🚩 La miniatura del menú se ha cambiado a predeterminado con éxito.*');
        }

        let q = msg.quoted ? msg.quoted : msg;
        if (!/image/.test(q.type)) return msg.reply('*🚩 Responde a una imagen para cambiar la miniatura del menú.*');

        let buffer = await q.download();
        setting.cover = await uploadToTelegraph(buffer);
        await db.save();
        await msg.reply('*🚩 La miniatura del menú se ha cambiado con éxito.*');
    }
};