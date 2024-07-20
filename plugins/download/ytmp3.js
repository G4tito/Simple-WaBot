const { formatSize } = require('../../lib/func.js');
const y2mate = require('../../lib/scraper/y2mate.js');
const youtube = require('../../lib/scraper/youtube.js');
const ufs = require('../../lib/ufs.js');

const isLimit = 15; // 15 MB

exports.cmd = {
    name: ['ytmp3'],
    command: ['ytmp3'],
    category: ['download'],
    detail: {
        desc: 'Descarga el audio del video de YouTube.',
        use: '@url=[yt]'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('Ingresa el enlace del video de *YouTube* que deseas descargar.');
        }
        
        if (!isYouTubeUrl(text)) {
            return msg.reply('Ingresa un enlace válido del video de *YouTube* que deseas descargar.');
        }

        await msg.react('🕓');
        
            let { status, result } = await y2mate.download(text, 'audio') || await youtube.download(text, 'audio');
            if (!status) {
                await msg.react('✖');
                return msg.reply('📛 | Hubo un error al obtener el resultado del audio.');
            }

            const audio = result.audio?.find(v => v.quality === '128') || { url: result.buffer };
            const size = await formatSize(await ufs(audio.url) || result.size);
            
            if (Number(size.split(' MB')[0]) >= isLimit || Number(size.split(' GB')[0]) >= 0) {
                await msg.react('✖');
                return msg.reply(`El audio pesa ${size}, excede el límite máximo de descarga que es de ${isLimit} MB.`);
            }

            await msg.reply(null, { audio: audio.url, fileName: result.title + '.mp3', mimetype: 'audio/mpeg' });
            await msg.react('✅');
    }
};

function isYouTubeUrl(url) {
    const regex = /^(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)\/?(?:\?.*v=|\/)?)([a-zA-Z0-9_-]+)/;
    return regex.test(url);
}
