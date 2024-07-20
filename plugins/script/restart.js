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
        await msg.reply('El bot se reiniciará en 3 segundos.');
        setTimeout(async () => {
            process.send('restart');
        }, 5000);
    }
};
