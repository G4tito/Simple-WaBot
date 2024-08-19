exports.cmd = {
    name: ['alive'],
    command: ['alive'],
    category: ['main'],
    detail: {
        desc: 'Verifica si el bot está en línea.',
    },
    async start({ msg }) {
        await msg.reply({ sticker: './media/sticker/alive.webp'});
    }
};
