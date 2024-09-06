const prodia = require('../../lib/scraper/prodia.js');

exports.cmd = {
    name: ['prodia'],
    command: ['prodia'],
    category: ['other'],
    detail: {
        desc: 'Genera una imagen con la inteligencia artificial de prodia.',
        use: 'prompt'
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa un texto para generar la imagen.*');
        }

        const json = await prodia.generate(text);
        await msg.reply({ image: json.result.url });
    }
};
