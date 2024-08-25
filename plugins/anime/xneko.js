const axios = require('axios');

exports.cmd = {
    name: ['xneko'],
    command: ['xneko'],
    category: ['anime'],
    detail: {
        desc: 'Envia una imagen aleatoria de una chica gato.'
    },
    setting: {
        error_react: true,
        isNsfw: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.pics/nsfw/neko');
        await msg.reply('Random neko image.', { image: res.data.url });
        await msg.react('✅');
    }
};