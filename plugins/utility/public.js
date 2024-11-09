exports.cmd = {
    name: ['public'],
    command: ['public'],
    category: ['utility'],
    detail: {
        desc: 'Activa el bot.'
    },
    setting: {
        isOwner: true
    },
    async start({ msg, sock, isGroup, db }) {
        const config = db.settings.get(sock.user.jid);
        if (config.mode === 'pulic') {
            return msg.reply('*🚩 El bot ya está activado.*');
        }
        config.mode = 'public';
        await db.save();
        await msg.reply('*🚩 El bot ha sido activado con éxito.*\n\n*🍟 Nota* ;\n- Ahora el bot responderá a todos los comandos.');
    }
};
