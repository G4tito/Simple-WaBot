const { WebpToImg } = require('../../lib/converter.js');

exports.cmd = {
    name: ['toimg'],
    command: ['toimg', 'toimage'],
    category: ['convert'],
    detail: {
        desc: 'Convierte un sticker a Imagen.',
        use: '@quoted=[img-stick]'
    },
    async start({ msg }) {
        let q = msg.quoted ? msg.quoted : msg;

        if (!/sticker/.test(q.type)) {
            return msg.reply('🏷️ | Responde a un *sticker* que quieras convertir en *imagen*. (El sticker no debe estar animado)');
        }

        if (q.isAnimated) {
            return msg.reply('El sticker no debe estar animado.');
        }

        let media = await q.download();
        let buffer = await WebpToImg(media);
        await msg.reply(null, { image: buffer });
    }
};
