const { owner } = require('../../setting.js');

exports.cmd = {
    name: ['report'],
    command: ['report'],
    category: ['utility'],
    detail: {
        desc: 'Reporta un fallo o cualquier problema al owner.',
        use: 'text'
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Debes proporcionar una descripción del problema.*');
        }

        if (text.length < 10) {
            return msg.reply(`*🚩 El reporte debe tener al menos 10 caracteres.*`);
        }

        if (text.length > 1000) {
            return msg.reply(`*🚩 El reporte no puede exceder los 1000 caracteres.*`);
        }

        const teks = `Reporte de *@${msg.sender.split('@')[0]}*:\n\n- “ ${text} ”`;

        const [ownerNumber] = owner[0];
        await msg.reply(teks, {
            mentions: [msg.sender],
            from: `${ownerNumber}@s.whatsapp.net`
        });

        await msg.reply('*🚩 Tu reporte ha sido enviado al owner. Por favor, asegúrate de que tus reportes sean serios y relevantes.*');
    }
};