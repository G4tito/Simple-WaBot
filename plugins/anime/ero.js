const axios = require('axios');

exports.cmd = {
    name: ['ero'],
    command: ['ero'],
    category: ['anime'],
    detail: {
        desc: 'Envia una imagen erógena aleatoria.'
    },
    setting: {
        error_react: true,
        isNsfw: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.im/search/?included_tags=ero');
        await msg.reply('Random ero image.', { image: res.data.images[0].url });
        await msg.react('✅');
    }
};