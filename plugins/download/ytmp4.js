const { formatSize } = require('../../lib/func.js');
const youtube = require('../../lib/scraper/youtube.js');

let isLimit = 70; // 70 MB

exports.cmd = {
    name: ['ytmp4'],
    command: ['ytmp4'],
    category: ['download'],
    detail: {
        use: 'url',
        desc: 'Descarga de videos de YouTube.',
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('Ingresa el enlace del video de *YouTube* que deseas descargar.');
        }
        
        if (!isYouTubeUrl(text)) {
            return msg.reply('Ingresa el enlace válido del video de *YouTube* que deseas descargar.');
        }

        await msg.react('🕓');
        let { status, result } = await youtube.download(text, 'video');
        
        if (!status) {
            await msg.react('✖');
            return msg.reply('📛 | Hubo un error al obtener el resultado del vídeo.');
        }

        let size = await formatSize(result.size);
        
        if (Number(size.split(' MB')[0]) >= isLimit || Number(size.split(' GB')[0]) >= 0) {
            await msg.react('✖');
            return msg.reply(`El video pesa ${size}, excede el límite máximo de descarga que es de ${isLimit} MB.`);
        }

        await msg.reply(result.title, { video: result.buffer });
        await msg.react('✅');
    }
};

function isYouTubeUrl(url) {
    let regex = /^(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)\/?(?:\?.*v=|\/)?)([a-zA-Z0-9_-]+)/;
    return regex.test(url);
}
