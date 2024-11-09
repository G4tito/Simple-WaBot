const { webpToVideo } = require('../../lib/scraper/ezgif.js');

exports.cmd = {
    name: ['tovid'],
    command: ['tovid', 'tovideo'],
    category: ['convert'],
    detail: {
        desc: 'Convierte un sticker animado a video.',
        use: 'stick.'
    },
    async start({ msg }) {
        let q = msg.quoted ? msg.quoted : msg;

        if (!/sticker/.test(q.type)) {
            return msg.reply('*🚩 Responde a un sticker que quieras convertir en video.* (El sticker debe estar animado)');
        }

        if (!q.media.isAnimated) {
            return msg.reply('*🚩 El sticker debe estar animado.*');
        }

        let media = await q.download();
        let { status, result } = await webpToVideo(media);

        if (!status) {
            return msg.reply('*📛 | Hubo un error al obtener el resultado.*');
        }

        await msg.reply({ video: result.url });
    }
};
