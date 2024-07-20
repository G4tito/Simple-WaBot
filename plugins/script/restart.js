exports.cmd = {
    name: ['restart'],
    command: ['restart', 'reset'],
    category: ['script'],
    detail: {
        desc: 'Reinicia el bot.'
    },
    setting: {
        isOwner: true
    },
    async start({ msg }) {
        setTimeout(async () => {
            await msg.reply('El bot se reiniciará en 3 segundos.');
            process.send('restart');
        }, 5000);
    }
};
