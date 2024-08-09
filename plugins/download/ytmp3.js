const { formatSize } = require('../../lib/func.js');
const { download } = require('../../lib/scraper/youtube.js');
const ufs = require('../../lib/ufs.js');

const isLimit = 20 * 1024 * 1024; // 20 MB

exports.cmd = {
    name: ['ytmp3'],
    command: ['ytmp3'],
    category: ['download'],
    detail: {
        desc: 'Descarga el audio del audio de YouTube.',
        use: '@url=[yt]'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa el enlace de una música de YouTube que deseas descargar.*');
        }
        
        if (!isYouTubeUrl(text)) {
            return msg.reply('*🚩 Por favor, ingresa un enlace válido de YouTube.*');
        }

        await msg.react('🕓');

        const audio = await getAudio(text);

        if (!audio) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const urlToUse = audio.url || audio.buffer;
        const sizeInBytes = await ufs(urlToUse);

        if (sizeInBytes >= isLimit) {
            const readableSize = await formatSize(sizeInBytes);
            const limitReadable = await formatSize(isLimit);
            await msg.react('✖');
            return msg.reply(`*📂 | El audio pesa ${readableSize}, excede el límite máximo de descarga que es de ${limitReadable}.*`);
        }

        await msg.reply(audio.title, { audio: urlToUse });
        await msg.react('✅');
    }
};

async function getAudio(url) {
    let status, result;
    for (const version of ['V2', 'V3', 'V1']) {
        ({ status, result } = await download[version](url, 'audio'));
        if (status) {
            const audio = result.audio?.find(v => v.quality === '128');
            if (audio) return audio;
        }
    }
    return null;
}

function isYouTubeUrl(url) {
    const regex = /^(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)\/?(?:\?.*v=|\/)?)([a-zA-Z0-9_-]+)/;
    return regex.test(url);
}