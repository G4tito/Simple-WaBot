const axios = require('axios');

exports.cmd = {
    name: ['ass'],
    command: ['ass'],
    category: ['anime'],
    detail: {
        desc: 'Envia una imagen aleatoria de unos traseros.'
    },
    setting: {
        error_react: true,
        isNsfw: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.im/search/?included_tags=ass');
        await msg.reply('Random ass image.', { image: res.data.images[0].url });
        await msg.react('✅');
    }
};