const axios = require('axios');

exports.cmd = {
    name: ['ecchi'],
    command: ['ecchi'],
    category: ['anime', 'images'],
    detail: {
        desc: 'Envia una imagen ecchi aleatoria.'
    },
    setting: {
        error_react: true,
        isNsfw: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.im/search/?included_tags=ecchi');
        await msg.reply('Random ecchi image.', { image: res.data.images[0].url });
        await msg.react('✅');
    }
};