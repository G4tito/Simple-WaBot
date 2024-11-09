const { formatSize } = require('../../lib/func.js');
const { download } = require('../../lib/scraper/pinterest.js');
const ufs = require('../../lib/ufs.js');

const SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB

exports.cmd = {
    name: ['pinterest'],
    command: ['pinterest', 'pin'],
    category: ['download'],
    detail: {
        desc: 'Descarga el video o imagen de Pinterest.',
        use: 'url'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa el enlace del video/imagen de Pinterest que deseas descargar.*');
        }

        if (!isPinterestUrl(text)) {
            return msg.reply('*🚩 Por favor, ingresa un enlace válido de Pinterest.*');
        }

        await msg.react('🕓');

        const { status, result } = await download(text);
        if (!status) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        if (!result) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const mediaType = Object.keys(result)[1];
        const urlToUse = result[mediaType].url;
        const sizeInBytes = await ufs(urlToUse);

        if (sizeInBytes >= SIZE_LIMIT) {
            const readableSize = await formatSize(sizeInBytes);
            const limitReadable = await formatSize(SIZE_LIMIT);
            await msg.react('✖');
            return msg.reply(`*📂 | El archivo pesa ${readableSize}, excede el límite máximo de descarga que es de ${limitReadable}.*`);
        }

        await msg.reply(result.title, { [mediaType]: urlToUse });
        await msg.react('✅');
    }
};

function isPinterestUrl(url) {
    const regex = /^(?:https?:\/\/)?(?:www\.)?(?:pinterest\.com\/(?:pin\/|search\/|video\/|(?:[a-zA-Z0-9_-]+\/)?[a-zA-Z0-9_-]+))|(?:pin\.it\/[a-zA-Z0-9_-]+)$/;
    return regex.test(url);
}