const { formatSize } = require('../../lib/func.js');
const facebook = require('../../lib/scraper/facebookV2.js');
const ufs = require('../../lib/ufs.js');

const isLimit = 50; // 50 MB

exports.cmd = {
    name: ['facebook'],
    command: ['facebook', 'fb'],
    category: ['download'],
    detail: {
        desc: 'Descarga videos de Facebook.',
        use: '@url=[fb]'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('Ingresa el enlace del video de *Facebook* que deseas descargar.');
        }
        
        if (!isFacebookUrl(text)) {
            return msg.reply('Ingresa un enlace válido del video de *Facebook* que deseas descargar.');
        }

        await msg.react('🕓');
        
        let { status, result } = await facebook.download(text);
        if (!status) {
            await msg.react('✖');
            return msg.reply('📛 | Hubo un error al obtener el resultado del vídeo.');
        }

        const filteredMedia = result.media.filter(m => m.quality === 'HD');
        for (let media of filteredMedia) {
            if (media.quality === 'HD') {
                const size = await formatSize(await ufs(media.url));
                if (Number(size.split(' MB')[0]) >= isLimit || Number(size.split(' GB')[0]) >= 0) {
                    await msg.react('✖');
                    return msg.reply(`El video pesa ${size}, excede el límite máximo de descarga que es de ${isLimit} MB.`);
                }
            }
            await msg.reply(result.title, { media: media.url });
        }

        await msg.react('✅');
    }
};

function isFacebookUrl(url) {
  const regex = /^https?:\/\/(www\.)?facebook\.com\/.+$/;
  return regex.test(url);
}
