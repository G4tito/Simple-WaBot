const axios = require('axios');

exports.cmd = {
    name: ['maid'],
    command: ['maid'],
    category: ['anime', 'images'],
    detail: {
        desc: 'Envia una imagen aleatoria de una maid.'
    },
    setting: {
        error_react: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.im/search/?included_tags=maid');
        await msg.reply('Random maid image.', { image: res.data.images[0].url });
        await msg.react('✅');
    }
};