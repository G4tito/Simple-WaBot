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
        use: 'url'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa el enlace del video de Instagram que deseas descargar.*');
        }
        
        if (!isInstagramUrl(text)) {
            return msg.reply('*🚩 Por favor, ingresa un enlace válido de Instagram.*');
        }

        await msg.react('🕓');
        const start = Date.now();
        
        let { status, result } = await instagram.download(text);
        if (!status) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const end = Date.now();

        let firstMedia = true;
        for (let media of result.media) {
            if (media.type === 'video') {
                const size = await formatSize(await ufs(media.url));
                if (Number(size.split(' MB')[0]) >= isLimit || Number(size.split(' GB')[0]) >= 0) {
                    await msg.react('✖');
                    return msg.reply(`*📂 | El video pesa ${size}, excede el límite máximo de descarga que es de ${isLimit} MB.*`);
                }
            }
            if (firstMedia) {
                await msg.reply(`🍟 *Scraping* · ${(end - start).toFixed(2)} ms`);
                firstMedia = false;
            }
            await msg.reply({ media: media.url });
        }

        await msg.react('✅');
    }
};

function isInstagramUrl(url) {
    const regex = /^https?:\/\/(www\.)?instagram\.com\/.+$/;
    return regex.test(url);
}
