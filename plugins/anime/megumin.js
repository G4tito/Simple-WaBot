const axios = require('axios');

exports.cmd = {
    name: ['megumin'],
    command: ['megumin'],
    category: ['anime'],
    detail: {
        desc: 'Envia una imagen aleatoria de megumin.'
    },
    setting: {
        error_react: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.waifu.pics/sfw/megumin');
        await msg.reply('Random megumin image.', { image: res.data.url });
        await msg.react('✅');
    }
};