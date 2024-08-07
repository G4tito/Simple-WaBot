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
        use: '@url=[fb]'
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

        let status, result;
        ({ status, result } = await download.V2(text));

        if (!status) {
            ({ status, result } = await download.V3(text));
        }

        if (!status) {
            ({ status, result } = await download.V1(text));
        }

        if (!status) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const end = Date.now();
        const filteredMedia = result.media.filter(m => (m?.quality || '').includes('HD'));

        for (const media of filteredMedia) {
            if ((media?.quality || '').includes('HD')) {
                const sizeInBytes = await ufs(media.url);

                if (sizeInBytes >= isLimit) {
                    const readableSize = await formatSize(sizeInBytes);
                    const limitReadable = await formatSize(isLimit);
                    await msg.react('✖');
                    return msg.reply(`*📂 | El video pesa ${readableSize}, excede el límite máximo de descarga que es de ${limitReadable}.*`);
                }
            }

            await msg.reply(`🍟 *Scraping* · ${(end - start).toFixed(3)} ms`, { media: media.url });
        }

        await msg.react('✅');
    }
};

function isFacebookUrl(url) {
    const regex = /^https?:\/\/(www\.)?facebook\.com\/.+$/;
    return regex.test(url);
}