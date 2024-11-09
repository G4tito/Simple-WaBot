const { owner } = require('../../setting.js');

exports.cmd = {
    name: ['request'],
    command: ['request', 'suggestion'],
    category: ['utility'],
    detail: {
        desc: 'Envía una solicitud o sugerencia al owner.',
        use: 'text'
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Debes proporcionar detalles de tu solicitud.*');
        }

        if (text.length < 10) {
            return msg.reply(`*🚩 La solicitud debe tener al menos 10 caracteres.*`);
        }

        if (text.length > 1000) {
            return msg.reply(`*🚩 La solicitud no puede exceder los 1000 caracteres.*`);
        }

        const teks = `Solicitud de *@${msg.sender.split('@')[0]}*:\n\n- “ ${text} ”`;

        const [ownerNumber] = owner[0];
        await msg.reply(teks, {
            mentions: [msg.sender],
            from: `${ownerNumber}@s.whatsapp.net`
        });

        await msg.reply('*🚩 Tu solicitud ha sido enviada al owner. Asegúrate de que tu solicitud sea seria y relevante.*');
    }
};