exports.cmd = {
    name: ['antilink'],
    command: ['antilink'],
    category: ['setting'],
    detail: {
        desc: 'Activa o desactiva el anti enlace en el grupo.',
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
            if (group.antilink === enable) {
                return msg.reply(`La función de *anti enlace* ya está *${enable ? 'activada' : 'desactivada'}* en este *grupo*.`);
            }
            group.antilink = enable;
            await db.save();
            return msg.reply(`La función de *anti enlace* se ha *${enable ? 'activado' : 'desactivado'}* con éxito para este *grupo*.`);
        }

        await msg.reply(`*🚩 Para configurar la Función Anti Enlace, simplemente escribe "on" para activarla o "off" para desactivarla.*`);
    }
};
