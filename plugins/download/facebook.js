const { formatSize } = require('../../lib/func.js');
const { download } = require('../../lib/scraper/facebook.js');
const ufs = require('../../lib/ufs.js');

const isLimit = 50 * 1024 * 1024; // 50 MB

exports.cmd = {
    name: ['facebook'],
    command: ['facebook', 'fb'],
    category: ['download'],
    detail: {
        desc: 'Descarga videos de Facebook.',
        use: 'url'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa el enlace del video de Facebook que deseas descargar.*');
        }

        if (!isFacebookUrl(text)) {
            return msg.reply('*🚩 Por favor, ingresa un enlace válido de Facebook.*');
        }

        await msg.react('🕓');
        const start = Date.now();

        const result = await getMedia(text);
        if (!result) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const end = Date.now();
        const sizeInBytes = await ufs(result.media.url);

        if (sizeInBytes >= isLimit) {
            const readableSize = await formatSize(sizeInBytes);
            const limitReadable = await formatSize(isLimit);
            await msg.react('✖');
            return msg.reply(`*📂 | El video pesa ${readableSize}, excede el límite máximo de descarga que es de ${limitReadable}.*`);
        }

        await msg.reply(`🍟 *Scraping* · ${(end - start).toFixed(2)} ms`, { media: result.media.url });
        await msg.react('✅');
    }
};

async function getMedia(url) {
    for (const version of ['V2', 'V3', 'V1']) {
        const { status, result } = await download[version](url);
        if (status) {
            let media = result.media.find(m => (m?.quality || '').includes('HD'));
            if (!media) {
                media = result.media.find(m => (m?.quality || '').includes('SD'));
            }
            if (media) {
                return {
                    title: result.title,
                    media
                };
            }
        }
    }
    return null;
}

function isFacebookUrl(url) {
    const regex = /^https?:\/\/([a-zA-Z0-9-]+\.)?(facebook|fb)\.com\/.+$/;
    return regex.test(url);
}