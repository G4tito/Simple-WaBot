exports.cmd = {
    name: ['nsfw'],
    command: ['nsfw'],
    category: ['setting'],
    detail: {
        desc: 'Activa o desactiva el NSFW en el grupo.',
        use: 'on/off'
    },
    setting: {
        isGroup: true,
        isAdmin: true
    },
    async start({ msg, args, db }) {
        const group = db.groups.get(msg.from).setting;
        const mode = args[0]?.toLowerCase();

        if (mode === 'on' || mode === 'off') {
            const enable = mode === 'on';
            if (group.nsfw === enable) {
                return msg.reply(`*🚩 La función de NSFW ya está ${enable ? 'activada' : 'desactivada'} en este grupo.*`);
            }
            group.nsfw = enable;
            await db.save();
            return msg.reply(`*🚩 La función de NSFW se ha ${enable ? 'activado' : 'desactivado'} con éxito para este grupo.*`);
        }

        await msg.reply('*🚩 Para configurar la Función NSFW, simplemente escribe "on" para activarla o "off" para desactivarla.*');
    }
};
