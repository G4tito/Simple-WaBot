const { formatSize } = require('../../lib/func.js');
const { download } = require('../../lib/scraper/tiktok.js');
const ufs = require('../../lib/ufs.js');

const SIZE_LIMIT = 50 * 1024 * 1024; // 50 MB

exports.cmd = {
    name: ['tiktok'],
    command: ['tiktok', 'tt'],
    category: ['download'],
    detail: {
        desc: 'Descarga el video de TikTok.',
        use: 'url',
    },
    setting: {
        error_react: true,
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa el enlace del video de TikTok que deseas descargar.*');
        }

        if (!isTikTokUrl(text)) {
            return msg.reply('*🚩 Por favor, ingresa un enlace válido de TikTok.*');
        }

        await msg.react('🕓');

        const result = await getVideo(text);

        if (!result) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const filteredMedia = result.media.filter(m => m.type === 'nwm' || m.type === 'photo');

        let firstMedia = true;
        for (const media of filteredMedia) {
            const mediaType = media.type === 'nwm' ? 'video' : 'image';

            if (mediaType === 'video') {
                const sizeInBytes = await ufs(media.url);
                const readableSize = await formatSize(sizeInBytes);
                const limitReadable = await formatSize(SIZE_LIMIT);

                if (sizeInBytes >= SIZE_LIMIT) {
                    await msg.react('✖');
                    return msg.reply(`*📂 | El video pesa ${readableSize}, excede el límite máximo de descarga que es de ${limitReadable}.*`);
                }
            }

            if (firstMedia) {
                await msg.reply(result.title, { [mediaType]: media.url });
                firstMedia = false;
            } else {
                await msg.reply({ [mediaType]: media.url });
            }
        }

        await msg.react('✅');
    }
};

async function getVideo(url) {
    for (const version of ['V1', 'V2']) {
        const { status, result } = await download[version](url);
        if (status) {
            return result;
        }
    }
    return null;
}

function isTikTokUrl(url) {
    const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?tiktok\.com\/(@[a-zA-Z0-9._-]+|[a-zA-Z0-9._-]+\/video\/\d+|[a-zA-Z0-9]+\/?)(\/.*)?$/;
    return regex.test(url);
}
