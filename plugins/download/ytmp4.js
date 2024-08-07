const { formatSize } = require('../../lib/func.js');
const y2mate = require('../../lib/scraper/y2mate.js');
const youtube = require('../../lib/scraper/youtube.js');
const ufs = require('../../lib/ufs.js');

const isLimit = 70 * 1024 * 1024; // 70 MB

exports.cmd = {
    name: ['ytmp3'],
    command: ['ytmp3'],
    category: ['download'],
    detail: {
        desc: 'Descarga el video de YouTube.',
        use: '@url=[yt]'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa el enlace del video de YouTube que deseas descargar.*');
        }
        
        if (!isYouTubeUrl(text)) {
            return msg.reply('*🚩 Por favor, ingresa un enlace válido de *YouTube*.');
        }

        await msg.react('🕓');

        let status, result;
        ({ status, result } = await y2mate.download(text, 'video'));
        if (!status) {
            ({ status, result } = await youtube.download(text, 'video'));
        }

        if (!status) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const video = result.video?.find(v => v.quality === '128') || { url: result.buffer };
        const sizeInBytes = await ufs(video.url);

        if (sizeInBytes >= isLimit) {
            const readableSize = await formatSize(sizeInBytes);
            const limitReadable = await formatSize(isLimit);
            await msg.react('✖');
            return msg.reply(`*📂 | El video pesa ${readableSize}, excede el límite máximo de descarga que es de ${limitReadable}.*`);
        }

        await msg.reply(result.title, { video: video.url });
        await msg.react('✅');
    }
};

function isYouTubeUrl(url) {
    const regex = /^(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)\/?(?:\?.*v=|\/)?)([a-zA-Z0-9_-]+)/;
    return regex.test(url);
}