const axios = require('axios');

exports.cmd = {
    name: ['neko'],
    command: ['neko'],
    category: ['anime', 'images'],
    detail: {
        desc: 'Envia una imagen aleatoria de una chica gato.'
    },
    setting: {
        error_react: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.pics/sfw/neko');
        await msg.reply('Random neko image.', { image: res.data.url });
        await msg.react('✅');
    }
};