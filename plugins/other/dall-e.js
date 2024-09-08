const { G4F } = require('g4f');
const g4f = new G4F();

exports.cmd = {
    name: ['dall-e'],
    command: ['dall-e', 'dalle'],
    category: ['other'],
    detail: {
        desc: 'Genera una imagen utilizando la inteligencia artificial Dall-E.',
        use: 'text'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa un texto para generar la imagen.*');
        }

        await msg.react('🕓');

        let result = await g4f.imageGeneration(text, { 
            debug: false,
            provider: g4f.providers.Dalle
        });

        if (!result) {
            return msg.reply('*⚠️︱Se produjo un error al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.*');
        }

        await msg.reply({ image: result });
        await msg.react('✅');
    }
};