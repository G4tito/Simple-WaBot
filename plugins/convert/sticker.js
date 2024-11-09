const { toWebp } = require('../../lib/sticker.js');
const { sticker } = require('../../setting.js');

exports.cmd = {
    name: ['sticker'],
    command: ['sticker', 's'],
    category: ['convert'],
    detail: {
        desc: 'Convierte una imagen/video/gif a Sticker.',
        use: 'media'
    },
    async start({ msg }) {
        let q = msg.quoted ? msg.quoted : msg;
        if (!/(image\/(?!webp))|video/.test(q.media?.mimetype)) {
            return msg.reply('*🚩 Responde a una imagen, video o gif para convertirlo en sticker.*');
        }
        
        let opts = {
            ...sticker,
            emojis: ['🧶', '🐈'],
            isFull: true,
            other: {
                'is-ai-sticker': 1
            }
        };
        
        let media = await q.download();
        let buffer = await toWebp(media, opts);
        await msg.reply({ sticker: buffer });
    }
};
