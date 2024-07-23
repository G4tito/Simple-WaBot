const { formatSize } = require('../../lib/func.js');
const instagram = require('../../lib/scraper/instagram.js');
const ufs = require('../../lib/ufs.js');

const isLimit = 50; // 50 MB

exports.cmd = {
    name: ['instagram'],
    command: ['instagram', 'ig'],
    category: ['download'],
    detail: {
        desc: 'Descarga videos o imágenes de Instagram.',
        use: '@url=[ig]'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('Ingresa el enlace del video de *Instagram* que deseas descargar.');
        }
        
        if (!isInstagramUrl(text)) {
            return msg.reply('Ingresa un enlace válido del video de *Instagram* que deseas descargar.');
        }

        await msg.react('🕓');
        
        let { status, result } = await instagram.download(text);
        if (!status) {
            await msg.react('✖');
            return msg.reply('📛 | Hubo un error al obtener el resultado del vídeo.');
        }

        for (let media of result.media) {
            if (media.type === 'video') {
                const size = await formatSize(await ufs(media.url));
                if (Number(size.split(' MB')[0]) >= isLimit || Number(size.split(' GB')[0]) >= 0) {
                    await msg.react('✖');
                    return msg.reply(`El video pesa ${size}, excede el límite máximo de descarga que es de ${isLimit} MB.`);
                }
            }
            await msg.reply(null, { media: media.url });
        }

        await msg.react('✅');
    }
};

function isInstagramUrl(url) {
  const regex = /^https?:\/\/(www\.)?instagram\.com\/.+$/;
  return regex.test(url);
}
