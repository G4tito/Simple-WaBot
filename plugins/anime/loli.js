const axios = require('axios');

exports.cmd = {
    name: ['loli'],
    command: ['loli'],
    category: ['anime'],
    detail: {
        desc: 'Envia una imagen aleatoria de una loli.'
    },
    setting: {
        error_react: true
    },
    async start({ msg }) {
        await msg.react('🕓');
        let res = await axios.get('https://api.lolicon.app/setu/v2?num=1&r18=0&tag=lolicon');
        await msg.reply('Random loli image.', { image: res.data.data[0].urls.original });
        await msg.react('✅');
    }
};