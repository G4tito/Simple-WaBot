exports.cmd = {
    name: ['alive'],
    command: ['alive'],
    category: ['basic'],
    detail: {
        desc: 'Verifica si el bot está en línea.',
    },
    async start({ msg }) {
        msg.reply('Hello there!');
    }
};
