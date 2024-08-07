exports.cmd = {
    name: ['welcome'],
    command: ['welcome'],
    category: ['setting'],
    detail: {
        desc: 'Activa o desactiva la bienvenida en el grupo.',
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
            if (group.welcome.status === enable) {
                return msg.reply(`La *bienvenida* ya está *${enable ? 'activada' : 'desactivada'}* en este *grupo*.`);
            }
            group.welcome.status = enable;
            await db.save();
            return msg.reply(`La función de *bienvenida* se ha *${enable ? 'activado' : 'desactivado'}* con éxito para este *grupo*.`);
        }

        await msg.reply(`Para *configurar* la *bienvenida* escribe *on* / *off*.\n\n- [ *on* ] ➠ Para activar\n- [ *off* ] ➠ Para desactivar`);
    }
};
