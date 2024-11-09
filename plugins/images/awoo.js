const axios = require('axios');

exports.cmd = {
    name: ['awoo'],
    command: ['awoo'],
    category: ['anime', 'images'],
    detail: {
        desc: 'Envia una imagen aleatoria de una chica lobo.'
    },
    setting: {
        error_react: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.pics/sfw/awoo');
        await msg.reply('Random awoo image.', { image: res.data.url });
        await msg.react('✅');
    }
};