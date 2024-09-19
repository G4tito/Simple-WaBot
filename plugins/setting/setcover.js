const upload = require('../../lib/scraper/upload.js');

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
        const setting = db.settings.get(sock.user.jid);

        if (args[0] === '--default') {
            setting.cover = '';
            return msg.reply('*🚩 La miniatura del menú se ha cambiado a predeterminado con éxito.*');
        }

        const q = msg.quoted || msg;
        if (!/image/.test(q.type)) {
            return msg.reply('*🚩 Responde a una imagen para cambiar la miniatura del menú.*');
        }

        const buffer = await q.download();
        const { status, result } = await upload.image(buffer);
        
        if (!status) {
            return msg.reply('*🚩 No se pudo cambiar la miniatura. Inténtalo de nuevo.*');
        }

        setting.cover = result.url;
        await db.save();
        await msg.reply('*🚩 La miniatura del menú se ha cambiado con éxito.*');
    }
};
