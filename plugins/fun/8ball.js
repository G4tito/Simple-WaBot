const { getRandom } = require('../../lib/func.js');

exports.cmd = {
    name: ['8ball'],
    command: ['8ball'],
    category: ['fun'],
    detail: {
        desc: 'Hazle una pregunta a la bola 8 mágica.',
        use: 'text'
    },
    async start({ text, msg }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa una pregunta para la bola 8 mágica.*');
        }

        const teks = getRandom(responses);
        await msg.reply(`(🎱) : *${teks}*`);
    }
};


const responses = [
    "Sí.",
    "No.",
    "Tal vez.",
    "Definitivamente.",
    "No cuentes con ello.",
    "Pregunta de nuevo más tarde.",
    "Es seguro.",
    "Mis fuentes dicen que no.",
    "Es dudoso.",
    "Sin lugar a dudas."
];
