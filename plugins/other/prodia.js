const prodia = require('../../lib/scraper/prodia.js');

exports.cmd = {
    name: ['prodia'],
    command: ['prodia'],
    category: ['other'],
    detail: {
        desc: 'Genera una imagen con la inteligencia artificial de Prodia.',
        use: 'prompt'
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa un texto para generar la imagen.*');
        }

        await msg.react('🕓');
        const json = await prodia.generate(text);

        if (!json.status) {
            return msg.reply('*🚩 Ups, ocurrió un error al generar la imagen.*');
        }

        await msg.reply({ image: json.result.url });
        await msg.react('✅');
    }
};