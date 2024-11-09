exports.cmd = {
    name: ['self'],
    command: ['self'],
    category: ['utility'],
    detail: {
        desc: 'Desactiva el bot.'
    },
    setting: {
        isOwner: true
    },
    async start({ msg, sock, isGroup, db }) {
        const config = db.settings.get(sock.user.jid);
        if (config.mode === 'self') {
            return msg.reply('*🚩 El bot ya está desactivado.*');
        }
        config.mode = 'self';
        await db.save();
        await msg.reply('*🚩 El bot ha sido desactivado con éxito.*\n\n*🍟 Nota* ;\n- Ahora el bot no responderá a ningún comando hasta que sea reactivado.');
    }
};
