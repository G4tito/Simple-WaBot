exports.cmd = {
    name: ['alive'],
    command: ['alive'],
    category: ['utility'],
    detail: {
        desc: 'Verifica si el bot está en línea.',
    },
    async start({ msg }) {
        await msg.reply({ sticker: './media/sticker/alive.webp'});
    }
};
