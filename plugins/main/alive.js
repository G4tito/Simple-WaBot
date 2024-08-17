const { formatDuration } = require('../../lib/func.js');

exports.cmd = {
    name: ['alive'],
    command: ['alive'],
    category: ['main'],
    detail: {
        desc: 'Verifica si el bot está en línea.',
    },
    async start({ msg, prefix, command }) {
        const uptime = formatDuration(process.uptime() * 1000);
        await msg.reply(`🧸 | *Online!* Activo durante *${uptime}*.`);
    }
};
