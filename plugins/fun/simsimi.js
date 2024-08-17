const fetch = require('node-fetch');

exports.cmd = {
    name: ['simsimi'],
    command: ['simsimi', 'simi'],
    category: ['fun'],
    detail: {
        desc: 'Interactúa con SimSimi.',
        use: 'text'
    },
    async start({ text, msg, sock }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa un texto para interactuar con SimSimi.*');
        }

        await sock.sendPresenceUpdate('composing', msg.from);

        const res = await fetch('https://api.simsimi.vn/v1/simtalk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `text=${encodeURIComponent(text)}&lc=es&key=`
        });

        const json = await res.json();
        await msg.reply(json.message);
    }
};