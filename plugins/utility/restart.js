exports.cmd = {
    name: ['restart'],
    command: ['restart', 'reset'],
    category: ['utility'],
    detail: {
        desc: 'Reinicia el bot.'
    },
    setting: {
        isOwner: true
    },
    async start({ msg }) {
        await msg.reply('♻ Reiniciando..');
        setTimeout(() => {
            process.send('restart');
        }, 5000);
    }
};