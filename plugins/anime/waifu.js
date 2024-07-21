const axios = require('axios');

exports.cmd = {
    name: ['waifu'],
    command: ['waifu'],
    category: ['anime'],
    detail: {
        desc: 'Envia una imagen aleatoria de una waifu.'
    },
    setting: {
        error_react: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.pics/sfw/waifu');
        await msg.reply('Random waifu image.', { image: res.data.url });
        await msg.react('✅');
    }
};