const axios = require('axios');

exports.cmd = {
    name: ['milf'],
    command: ['milf'],
    category: ['anime', 'images'],
    detail: {
        desc: 'Envia una imagen aleatoria de una milf.'
    },
    setting: {
        error_react: true,
        isNsfw: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.im/search/?included_tags=milf');
        await msg.reply('Random milf image.', { image: res.data.images[0].url });
        await msg.react('✅');
    }
};