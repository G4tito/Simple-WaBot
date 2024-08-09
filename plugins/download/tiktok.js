const { formatSize } = require('../../lib/func.js');
const tiktok = require('../../lib/scraper/tiktok.js');
const ufs = require('../../lib/ufs.js');

const isLimit = 50; // 50 MB

exports.cmd = {
    name: ['tiktok'],
    command: ['tiktok', 'tt'],
    category: ['download'],
    detail: {
        desc: 'Descarga videos de TikTok.',
        use: '@url=[tt]'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa el enlace del video de TikTok que deseas descargar.*');
        }

        if (!isTikTokUrl(text)) {
            return msg.reply('*🚩 Por favor, ingresa un enlace válido de TikTok.*');
        }

        await msg.react('🕓');

        let { status, result } = await tiktok.download(text);
        if (!status) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const filteredMedia = result.media.filter(m => m.type === 'nwm' || m.type === 'photo');
        for (let media of filteredMedia) {
            if (media.type === 'nwm') {
                const size = await formatSize(await ufs(media.url));
                if (Number(size.split(' MB')[0]) >= isLimit || Number(size.split(' GB')[0]) >= 0) {
                    await msg.react('✖');
                    return msg.reply(`*📂 | El video pesa ${size}, excede el límite máximo de descarga que es de ${isLimit} MB.*`);
                }
            }
            await msg.reply(result.title, { media: media.url });
        }

        await msg.react('✅');
    }
};

function isTikTokUrl(url) {
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?tiktok\.com\/(@[a-zA-Z0-9._-]+|[a-zA-Z0-9._-]+\/video\/\d+|[a-zA-Z0-9]+\/?)(\/.*)?$/;
    return regex.test(url);
}
